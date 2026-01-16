import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      roleId?: string;
      branchId?: string | null;
      isSuperAdmin?: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
