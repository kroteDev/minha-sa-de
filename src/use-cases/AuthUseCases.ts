import { User } from '../domain/entities';
import { IUserRepository } from '../domain/repositories/interfaces';

export class AuthUseCases {
  constructor(private userRepository: IUserRepository) {}

  async register(params: { name: string; email: string; password: string; birthDate?: string; gender?: 'MALE' | 'FEMALE' | 'OTHER' }): Promise<User> {
    const { name, email, password, birthDate, gender } = params;

    if (!name || name.trim().length < 2) {
      throw new Error('O nome deve ter pelo menos 2 caracteres.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido.');
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const existing = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (existing) {
      throw new Error('Este email já está cadastrado.');
    }

    // Hash simplificado para demonstração/client e compatível com backend
    const passwordHash = `hash_${btoa(password)}`;

    return await this.userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      birthDate,
      gender: gender || 'OTHER',
    });
  }

  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Preencha email e senha.');
    }

    const user = await this.userRepository.verifyPassword(email.toLowerCase().trim(), password);
    if (!user) {
      throw new Error('Credenciais inválidas. Verifique seu email e senha.');
    }

    return user;
  }
}
