import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
<<<<<<< HEAD
    console.log('JwtAuthGuard canActivate called');
=======
>>>>>>> fcf12ecd8ae1e65eaf27791908ac7b454a0bf3d3
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
<<<<<<< HEAD
    console.log('Is public:', isPublic);
=======
>>>>>>> fcf12ecd8ae1e65eaf27791908ac7b454a0bf3d3
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
