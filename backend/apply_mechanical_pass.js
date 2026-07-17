const fs = require('fs');
const path = require('path');

const models = [
  'wishlist', 'coupon', 'productReview', 'payment', 
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

  // 1. Write Validator Schema
  const schemaContent = `import { z } from 'zod';\n\nexport const create${Name}Schema = z.any(); // TODO: Implement strict validation based on schema\n`;
  fs.writeFileSync(path.join(basePath, 'validators', `${fileName}.schema.ts`), schemaContent);

  // 2 & 4. Update Controller
  const controllerPath = path.join(basePath, 'controllers', `${fileName}.controller.ts`);
  if (fs.existsSync(controllerPath)) {
    let controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    if (!controllerContent.includes(`create${Name}Schema`)) {
      controllerContent = `import { create${Name}Schema } from '../validators/${fileName}.schema';\n` + controllerContent;
    }

    const replaceTarget = `const data = await service.create(req.body);`;
    const replacement = `const validatedData = create${Name}Schema.parse(req.body);\n    const data = await service.create(validatedData);`;
    
    if (controllerContent.includes(replaceTarget)) {
      controllerContent = controllerContent.replace(replaceTarget, replacement);
    }
    
    fs.writeFileSync(controllerPath, controllerContent);
  }

  // 3. Update Routes
  const routePath = path.join(basePath, 'routes', `${fileName}.routes.ts`);
  if (fs.existsSync(routePath)) {
    let routeContent = fs.readFileSync(routePath, 'utf8');
    
    if (!routeContent.includes(`authenticateJWT`)) {
      routeContent = `import { authenticateJWT, authorizeRBAC } from '../middlewares/auth.middleware';\n` + routeContent;
    }
    
    const postRoute = `router.post('/', create${Name});`;
    const newPostRoute = `router.post('/', authenticateJWT, authorizeRBAC(['${fileName}.create']), create${Name});`;
    
    if (routeContent.includes(postRoute)) {
      routeContent = routeContent.replace(postRoute, newPostRoute);
    }
    
    fs.writeFileSync(routePath, routeContent);
  }
});

console.log('4-step mechanical pass applied successfully.');
