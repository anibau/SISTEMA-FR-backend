import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Verificar si ya existe un cliente con el mismo documento
    const clienteExistente = await this.clienteRepository.findOne({
      where: { numeroDocumento: createClienteDto.numeroDocumento }
    });

    if (clienteExistente) {
      throw new ConflictException('Ya existe un cliente con este documento');
    }

    // Verificar si ya existe un cliente con el mismo teléfono
    const clienteTelefono = await this.clienteRepository.findOne({
      where: { telefono: createClienteDto.telefono }
    });

    if (clienteTelefono) {
      throw new ConflictException('Ya existe un cliente con este teléfono');
    }

    const cliente = this.clienteRepository.create({
      ...createClienteDto,
      fechaNacimiento: createClienteDto.fechaNacimiento ? new Date(createClienteDto.fechaNacimiento) : null,
      puntosAcumulados: 0,
      montoTotalCompras: 0,
      deudaActual: 0,
      // esVip: false, // No existe en la entidad
      // verificadoWhatsapp: false, // No existe en la entidad
    });

    return await this.clienteRepository.save(cliente);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: Cliente[], total: number }> {
    const queryBuilder = this.clienteRepository.createQueryBuilder('cliente')
      .where('cliente.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(cliente.nombres ILIKE :search OR cliente.apellidos ILIKE :search OR cliente.documento ILIKE :search OR cliente.telefono ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('cliente.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id, isActive: true },
      relations: ['ventas', 'fiados'],
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async findByDocumento(documento: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { numeroDocumento: documento, isActive: true },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async findByTelefono(telefono: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { telefono, isActive: true },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);

    // Si se está actualizando el documento, verificar que no exista otro cliente con el mismo
    if (updateClienteDto.numeroDocumento && updateClienteDto.numeroDocumento !== cliente.numeroDocumento) {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { numeroDocumento: updateClienteDto.numeroDocumento }
      });
      if (clienteExistente) {
        throw new ConflictException('Ya existe un cliente con este documento');
      }
    }

    // Si se está actualizando el teléfono, verificar que no exista otro cliente con el mismo
    if (updateClienteDto.telefono && updateClienteDto.telefono !== cliente.telefono) {
      const clienteTelefono = await this.clienteRepository.findOne({
        where: { telefono: updateClienteDto.telefono }
      });
      if (clienteTelefono) {
        throw new ConflictException('Ya existe un cliente con este teléfono');
      }
    }

    const datosActualizacion = {
      ...updateClienteDto,
      fechaNacimiento: updateClienteDto.fechaNacimiento ? new Date(updateClienteDto.fechaNacimiento) : undefined,
    };

    await this.clienteRepository.update(id, datosActualizacion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.update(id, { isActive: false });
  }

  async agregarPuntos(id: string, puntos: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    cliente.puntosAcumulados += puntos;
    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async canjearPuntos(id: string, puntos: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    
    if (cliente.puntosAcumulados < puntos) {
      throw new ConflictException('Puntos insuficientes');
    }

    cliente.puntosAcumulados -= puntos;
    cliente.puntosCanjeados += puntos;
    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async actualizarSaldoFiado(id: string, monto: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    cliente.deudaActual += monto;
    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async pagarFiado(id: string, monto: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    
    if (cliente.deudaActual < monto) {
      throw new ConflictException('El monto a pagar es mayor al saldo pendiente');
    }

    cliente.deudaActual -= monto;
    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async getRankingPorPuntos(limit: number = 10): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { isActive: true },
      order: { puntosAcumulados: 'DESC' },
      take: limit,
    });
  }

  async getRankingPorCompras(limit: number = 10): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { isActive: true },
      order: { totalCompras: 'DESC' },
      take: limit,
    });
  }

  async getClientesConCumpleanos(): Promise<Cliente[]> {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const dia = hoy.getDate();

    return await this.clienteRepository
      .createQueryBuilder('cliente')
      .where('cliente.isActive = :isActive', { isActive: true })
      .andWhere('EXTRACT(MONTH FROM cliente.fechaNacimiento) = :mes', { mes })
      .andWhere('EXTRACT(DAY FROM cliente.fechaNacimiento) = :dia', { dia })
      .getMany();
  }

  async getClientesConFiadosVencidos(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { 
        isActive: true,
        deudaActual: MoreThan(0) // Clientes con deuda > 0
      },
      relations: ['fiados'],
    });
  }

  async verificarWhatsapp(id: string): Promise<Cliente> {
    const cliente = await this.findOne(id);
    // Marcar como verificado por WhatsApp (agregar campo si es necesario)
    // cliente.verificadoWhatsapp = true;
    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async marcarComoVip(id: string): Promise<Cliente> {
    const cliente = await this.findOne(id);
    // Marcar como VIP (agregar campo si es necesario)
    // cliente.esVip = true;
    await this.clienteRepository.save(cliente);
    return cliente;
  }

  async getEstadisticas(): Promise<any> {
    const totalClientes = await this.clienteRepository.count({
      where: { isActive: true }
    });

    const clientesVip = await this.clienteRepository.count({
      where: { isActive: true } // Filtrar por VIP cuando se agregue el campo
    });

    const clientesConFiados = await this.clienteRepository.count({
      where: { isActive: true, deudaActual: MoreThan(0) }
    });

    const totalPuntos = await this.clienteRepository
      .createQueryBuilder('cliente')
      .select('SUM(cliente.puntosAcumulados)', 'total')
      .where('cliente.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalCompras = await this.clienteRepository
      .createQueryBuilder('cliente')
      .select('SUM(cliente.totalCompras)', 'total')
      .where('cliente.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalClientes,
      clientesVip,
      clientesConFiados,
      totalPuntos: totalPuntos?.total || 0,
      totalCompras: totalCompras?.total || 0,
    };
  }
}
