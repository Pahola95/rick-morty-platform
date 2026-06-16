import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() id!: number;
  @Input() name!: string;
  @Input() image?: string;
  @Input() subtitle?: string;
  @Input() badge?: string;
  @Input() badgeColor?: string;
  @Input() type!: 'CHARACTER' | 'LOCATION' | 'EPISODE';
  @Input() isFavorite = false;
  @Output() favoriteToggle = new EventEmitter<void>();
  @Output() cardClick = new EventEmitter<void>();
}