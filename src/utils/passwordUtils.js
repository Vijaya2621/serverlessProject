import './moduleResolver.js';
import { bcrypt } from './moduleLoader.js';

class PasswordUtils {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

export default new PasswordUtils();