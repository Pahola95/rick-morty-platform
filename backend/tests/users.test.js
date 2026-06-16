const userService = require('../src/modules/users/user.service');
const userRepository = require('../src/modules/users/user.repository');

jest.mock('../src/modules/users/user.repository');
jest.mock('../src/config/redis', () => require('./mocks/redis.mock'));
jest.mock('../src/config/rabbitmq', () => require('./mocks/rabbitmq.mock'));
jest.mock('../src/config/db', () => require('./mocks/db.mock'));

describe('User Service', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('getAllUsers', () => {
    it('debe retornar todos los usuarios', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com', role: 'USER' },
        { id: '2', name: 'User 2', email: 'user2@test.com', role: 'ADMIN' }
      ];
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateRole', () => {
    it('debe actualizar el rol correctamente', async () => {
      const mockUser = { id: '1', name: 'User 1', role: 'USER' };
      const updatedUser = { ...mockUser, role: 'ADMIN' };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateRole.mockResolvedValue(updatedUser);

      const result = await userService.updateRole('1', 'ADMIN');

      expect(userRepository.updateRole).toHaveBeenCalledWith('1', 'ADMIN');
      expect(result.role).toBe('ADMIN');
    });

    it('debe lanzar error si el rol es inválido', async () => {
      await expect(userService.updateRole('1', 'SUPERUSER'))
        .rejects.toMatchObject({ status: 400, message: 'Rol inválido' });
    });

    it('debe lanzar error si el usuario no existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.updateRole('999', 'ADMIN'))
        .rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
    });
  });

  describe('deleteUser', () => {
    it('debe eliminar un usuario existente', async () => {
      const mockUser = { id: '1', name: 'User 1' };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.deleteUser.mockResolvedValue(1);

      const result = await userService.deleteUser('1');

      expect(userRepository.deleteUser).toHaveBeenCalledWith('1');
      expect(result.message).toBe('Usuario eliminado');
    });

    it('debe lanzar error si el usuario no existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('999'))
        .rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
    });
  });

  describe('getProfile', () => {
    it('debe retornar el perfil del usuario', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@test.com', role: 'USER' };
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getProfile('1');

      expect(result).toEqual(mockUser);
    });

    it('debe lanzar error si el usuario no existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getProfile('999'))
        .rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
    });
  });
});