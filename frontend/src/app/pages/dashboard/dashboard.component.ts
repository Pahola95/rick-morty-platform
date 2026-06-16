import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { CharacterService } from '../../core/services/character.service';
import { LocationService } from '../../core/services/location.service';
import { EpisodeService } from '../../core/services/episode.service';
import { ChartData, ChartOptions } from 'chart.js';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = signal(false);
  charStats: any = null;
  locStats: any = null;
  epStats: any = null;

  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  speciesChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  topCharactersChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#caf0f8' } } },
    scales: {
      x: { ticks: { color: '#caf0f8' }, grid: { color: '#0f3460' } },
      y: { ticks: { color: '#caf0f8' }, grid: { color: '#0f3460' } }
    }
  };

  doughnutOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#caf0f8' }, position: 'bottom' } }
  };

  constructor(
    private characterService: CharacterService,
    private locationService: LocationService,
    private episodeService: EpisodeService,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.loadStats();
    this.auth.getAccessTokenSilently().subscribe({
      next: (token) => console.log('TOKEN:', token),
      error: (err) => console.error('ERROR TOKEN:', err)
    });
  }
  loadTopCharacters() {
    // Obtener varios episodios y contar apariciones de personajes
    const characterCount: { [id: string]: number } = {};
    const characterNames: { [id: string]: string } = {};
    let pagesLoaded = 0;
    const totalPages = 3; // Primeras 3 páginas de episodios

    for (let i = 1; i <= totalPages; i++) {
      this.episodeService.getEpisodes(i).subscribe(res => {
        res.data.results.forEach((ep: any) => {
          ep.characters.forEach((url: string) => {
            const id = url.split('/').pop() || '';
            characterCount[id] = (characterCount[id] || 0) + 1;
          });
        });

        pagesLoaded++;
        if (pagesLoaded === totalPages) {
          // Obtener top 10 personajes
          const top10 = Object.entries(characterCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

          // Cargar nombres de los personajes
          const ids = top10.map(([id]) => id).join(',');
          this.characterService.getCharactersByIds(ids).subscribe((res: any) => {
            const characters = Array.isArray(res.data) ? res.data : [res.data];
            this.topCharactersChartData = {
              labels: characters.map((c: any) => c.name),
              datasets: [{
                label: 'Apariciones en episodios',
                data: characters.map((c: any) => {
                  const found = top10.find(([id]) => id === String(c.id));
                  return found ? found[1] : 0;
                }),
                backgroundColor: [
                  '#00b4d8', '#06d6a0', '#ffd166', '#ef476f',
                  '#118ab2', '#48cae4', '#90e0ef', '#0096c7',
                  '#023e8a', '#48cae4'
                ]
              }]
            };
            this.loading.set(false);
          });
        }
      });
    }
  }
  loadStats() {
    this.loading.set(true);

    this.characterService.getCharacterStats().subscribe(res => {
      this.charStats = res.data;
      this.statusChartData = {
        labels: ['Vivos', 'Muertos', 'Desconocido'],
        datasets: [{
          data: [res.data.alive, res.data.dead, res.data.unknown],
          backgroundColor: ['#06d6a0', '#ef476f', '#ffd166']
        }]
      };

      const topSpecies = Object.entries(res.data.species)
        .sort((a: any, b: any) => b[1] - a[1]).slice(0, 6);
      this.speciesChartData = {
        labels: topSpecies.map(s => s[0]),
        datasets: [{
          label: 'Personajes',
          data: topSpecies.map(s => s[1] as number),
          backgroundColor: '#00b4d8'
        }]
      };
    });

    this.locationService.getLocationStats().subscribe(res => {
      this.locStats = res.data;
    });

    this.episodeService.getEpisodeStats().subscribe(res => {
      this.epStats = res.data;
      this.loadTopCharacters();
    });
  }
}