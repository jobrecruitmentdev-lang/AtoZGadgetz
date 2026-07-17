const fs = require('fs');
const path = require('path');

const models = [
  'wishlist', 'coupon', 'productReview', 'order', 'payment', 
  'inventory', 'shipment', 'returnOrder', 'banner', 
  'homepageSection', 'offer', 'auditLog', 'userSession', 
  'mediaFile', 'notification', 'analyticsEvent'
];

function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const basePath = path.join(__dirname, 'src');

models.forEach(model => {
  const Name = capitalize(model);
  const name = model;
  const fileName = camelToSnakeCase(model);

  // 1. Repository
  const repoContent = `import { prisma } from '../prisma';

export class ${Name}Repository {
  async findAll() {
    return prisma.${name}.findMany();
  }
  async findById(id: number) {
    return prisma.${name}.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.${name}.create({ data });
  }
}
`;
  fs.writeFileSync(path.join(basePath, 'repositories', `${fileName}.repository.ts`), repoContent);

  // 2. Service
  const serviceContent = `import { ${Name}Repository } from '../repositories/${fileName}.repository';

const repo = new ${Name}Repository();

export class ${Name}Service {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }
}
`;
  fs.writeFileSync(path.join(basePath, 'services', `${fileName}.service.ts`), serviceContent);

  // 3. Controller
  const controllerContent = `import { Request, Response } from 'express';
import { ${Name}Service } from '../services/${fileName}.service';

const service = new ${Name}Service();

export const getAll${Name}s = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ status: true, data });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const create${Name} = async (req: Request, res: Response) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ status: true, data });
  } catch (error: any) {
    res.status(400).json({ status: false, message: error.message });
  }
};
`;
  fs.writeFileSync(path.join(basePath, 'controllers', `${fileName}.controller.ts`), controllerContent);

  // 4. Routes
  const routeContent = `import { Router } from 'express';
import { getAll${Name}s, create${Name} } from '../controllers/${fileName}.controller';

const router = Router();

router.get('/', getAll${Name}s);
router.post('/', create${Name});

export default router;
`;
  fs.writeFileSync(path.join(basePath, 'routes', `${fileName}.routes.ts`), routeContent);
});

// Update server.ts
let serverContent = fs.readFileSync(path.join(basePath, 'server.ts'), 'utf8');

let imports = '';
let appUses = '';

models.forEach(model => {
  const fileName = camelToSnakeCase(model);
  const routeName = `${model}Routes`;
  imports += `import ${routeName} from './routes/${fileName}.routes';\n`;
  appUses += `app.use('/api/${fileName.replace('_', '-')}', ${routeName});\n`;
});

// Avoid duplicate imports
if (!serverContent.includes('import wishlistRoutes')) {
  serverContent = serverContent.replace("import cartRoutes from './routes/cart.routes';", "import cartRoutes from './routes/cart.routes';\\n" + imports);
  serverContent = serverContent.replace("app.use('/api/cart', cartRoutes);", "app.use('/api/cart', cartRoutes);\\n" + appUses);
  fs.writeFileSync(path.join(basePath, 'server.ts'), serverContent);
}

console.log('Boilerplates generated successfully.');
