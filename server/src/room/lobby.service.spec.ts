import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LobbyService } from './lobby.service';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { NotFoundException } from '@nestjs/common';

describe('LobbyService', () => {
  let service: LobbyService;
  let repository: Repository<Room>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LobbyService>(LobbyService);
    repository = module.get<Repository<Room>>(getRepositoryToken(Room));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRooms', () => {
    it('should return all rooms', async () => {
      const mockRooms = [
        {
          id: '1',
          name: 'Room 1',
          gameType: 'war',
          maxPlayers: 4,
          isStarted: false,
        },
        {
          id: '2',
          name: 'Room 2',
          gameType: 'eratzIr',
          maxPlayers: 2,
          isStarted: true,
        },
      ];

      mockRepository.find.mockResolvedValue(mockRooms);

      const result = await service.getAllRooms();

      expect(result).toEqual(mockRooms);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('getRoomById', () => {
    it('should return a room when found', async () => {
      const mockRoom = {
        id: '1',
        name: 'Room 1',
        gameType: 'war',
        maxPlayers: 4,
        isStarted: false,
      };

      mockRepository.findOne.mockResolvedValue(mockRoom);

      const result = await service.getRoomById('1');

      expect(result).toEqual(mockRoom);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when room not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getRoomById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });
  });

  describe('createRoom', () => {
    it('should create a new room successfully', async () => {
      const createRoomDto: CreateRoomDto = {
        name: 'New Room',
        gameType: 'war',
        maxPlayers: 4,
      };

      const mockRoom = {
        id: '1',
        ...createRoomDto,
        isStarted: false,
      };

      mockRepository.create.mockReturnValue(mockRoom);
      mockRepository.save.mockResolvedValue(mockRoom);

      const result = await service.createRoom(createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(mockRepository.create).toHaveBeenCalledWith(createRoomDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockRoom);
    });
  });

  describe('deleteRoom', () => {
    it('should delete a room successfully', async () => {
      const mockDeleteResult = { affected: 1 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.deleteRoom('1');

      expect(result).toEqual({ message: 'Room with ID 1 deleted successfully' });
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when room not found', async () => {
      const mockDeleteResult = { affected: 0 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      await expect(service.deleteRoom('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('deleteAllRooms', () => {
    it('should delete all rooms successfully', async () => {
      mockRepository.clear.mockResolvedValue(undefined);

      const result = await service.deleteAllRooms();

      expect(result).toEqual({ message: 'All rooms deleted successfully' });
      expect(mockRepository.clear).toHaveBeenCalled();
    });
  });
});

