import path from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

const isDev = process.env.NODE_ENV !== 'production';
let inlineEditPlugin, editModeDevPlugin;

if (isDev) {
	inlineEditPlugin = (await import('./plugins/visual-editor/vite-plugin-react-inline-editor.js')).default;
	editModeDevPlugin = (await import('./plugins/visual-editor/vite-plugin-edit-mode.js')).default;
}

const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    let mockData = { categories: [{ id: 1, name: 'Kaporta' }], models: [] };
    try {
      if (fs.existsSync('./mockData.json')) {
        mockData = JSON.parse(fs.readFileSync('./mockData.json', 'utf8'));
      }
    } catch (err) {}

    server.middlewares.use('/api/', (req, res, next) => {
      if (req.url.includes('login.php')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, user: { id: 1, email: 'admin@firatoto.com', admin: 1 } }));
        return;
      }
      if (req.url.includes('products.php')) {
        if (!mockData.products) {
          const makeSlug = (text) => {
            const trMap = {'ç':'c','ğ':'g','ı':'i','i':'i','ö':'o','ş':'s','ü':'u','Ç':'c','Ğ':'g','İ':'i','I':'i','Ö':'o','Ş':'s','Ü':'u'};
            return String(text||'').replace(/[çğiıöşüÇĞİIÖŞÜ]/g, m => trMap[m] || m)
              .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
          };
          mockData.products = Array.from({ length: 15 }).map((_, i) => ({
            id: i + 1,
            name: 'Örnek Parça ' + (i + 1),
            brand: 'BMW',
            model: 'X5',
            partNumber: '123456789',
            price: (Math.random() * 1000).toFixed(2),
            stock: Math.floor(Math.random() * 10),
            category: 'Motor Mekanik',
            product_condition: 'Sıfır',
            imageUrl: null,
            slug_name: makeSlug('Örnek Parça ' + (i + 1)),
            slug_brand: makeSlug('BMW')
          }));
        }
        
        if (req.method === 'GET') {
          const hasPage = req.url.includes('page=');
          res.setHeader('Content-Type', 'application/json');
          if (hasPage) {
            res.end(JSON.stringify({
              success: true,
              total: mockData.products.length,
              page: 1,
              pages: 1,
              products: mockData.products
            }));
          } else {
            res.end(JSON.stringify(mockData.products));
          }
          return;
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            const data = JSON.parse(body || '{}');
            data.id = Date.now();
            if (!data.product_condition) data.product_condition = 'Sıfır';
            
            const makeSlug = (text) => {
              const trMap = {'ç':'c','ğ':'g','ı':'i','i':'i','ö':'o','ş':'s','ü':'u','Ç':'c','Ğ':'g','İ':'i','I':'i','Ö':'o','Ş':'s','Ü':'u'};
              return String(text||'').replace(/[çğiıöşüÇĞİIÖŞÜ]/g, m => trMap[m] || m)
                .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
            };
            data.slug_name = makeSlug(data.name);
            data.slug_brand = makeSlug(data.brand);

            mockData.products.unshift(data);
            fs.writeFileSync('./mockData.json', JSON.stringify(mockData, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, id: data.id }));
          });
          return;
        } else if (req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            const data = JSON.parse(body || '{}');
            
            const makeSlug = (text) => {
              const trMap = {'ç':'c','ğ':'g','ı':'i','i':'i','ö':'o','ş':'s','ü':'u','Ç':'c','Ğ':'g','İ':'i','I':'i','Ö':'o','Ş':'s','Ü':'u'};
              return String(text||'').replace(/[çğiıöşüÇĞİIÖŞÜ]/g, m => trMap[m] || m)
                .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
            };
            if (data.name) data.slug_name = makeSlug(data.name);
            if (data.brand) data.slug_brand = makeSlug(data.brand);

            const index = mockData.products.findIndex(p => p.id == (req.url.split('id=')[1] || data.id));
            if (index > -1) {
              mockData.products[index] = { ...mockData.products[index], ...data };
              fs.writeFileSync('./mockData.json', JSON.stringify(mockData, null, 2));
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          });
          return;
        } else if (req.method === 'DELETE') {
          const id = req.url.split('id=')[1];
          mockData.products = mockData.products.filter(p => p.id != id);
          fs.writeFileSync('./mockData.json', JSON.stringify(mockData, null, 2));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }
      if (req.url.includes('productbrands.php')) {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(mockData.productbrands || []));
          return;
        } else {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            if (req.method === 'POST') {
              const data = JSON.parse(body || '{}');
              const newBrand = { id: Date.now(), name: data.name, image_url: data.image_url, is_general: data.is_general ? 1 : 0 };
              if (!mockData.productbrands) mockData.productbrands = [];
              mockData.productbrands.unshift(newBrand);
              fs.writeFileSync('./mockData.json', JSON.stringify(mockData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, id: newBrand.id }));
            } else if (req.method === 'PUT') {
              const data = JSON.parse(body || '{}');
              const index = mockData.productbrands.findIndex(b => b.id == data.id);
              if (index > -1) {
                mockData.productbrands[index] = { ...mockData.productbrands[index], ...data, is_general: data.is_general ? 1 : 0 };
                fs.writeFileSync('./mockData.json', JSON.stringify(mockData, null, 2));
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } else if (req.method === 'DELETE') {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const id = url.searchParams.get('id');
              mockData.productbrands = mockData.productbrands.filter(b => b.id != id);
              fs.writeFileSync('./mockData.json', JSON.stringify(mockData, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            }
          });
          return;
        }
      }
      if (req.url.includes('categories.php')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mockData.categories));
        return;
      }
      if (req.url.includes('brand_models.php')) {
        const urlParams = new URL(req.url, 'http://localhost');
        const brand = urlParams.searchParams.get('brand');
        const action = urlParams.searchParams.get('action');
        if (action === 'brands') {
          const uniqueBrands = Array.from(new Set(mockData.models.map(m => m.brand)));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(uniqueBrands));
          return;
        }
        let brandModels = mockData.models;
        if (brand) {
          brandModels = brandModels.filter(m => m.brand === brand);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(brandModels));
        return;
      }
      if (req.url.includes('admin_users.php')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, users: [] }));
        return;
      }
      if (req.url.includes('shipped_cargos.php')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
          { id: 1, image_url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80', title: 'Sivas Kargo' },
          { id: 2, image_url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&q=80', title: 'İstanbul Teslimat' },
          { id: 3, image_url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80', title: 'İzmir Motor Parçaları' },
          { id: 4, image_url: 'https://images.unsplash.com/photo-1586528116311-ad8ed745d44c?w=800&q=80', title: 'Ankara Sipariş' },
        ]));
        return;
      }
      
      if (req.url.includes('media.php')) {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'GET') {
          // Fake media list
          res.end(JSON.stringify([
            { name: 'mock-1.jpg', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=500&q=80', size: 102400, date: Date.now() / 1000 },
            { name: 'mock-2.jpg', url: 'https://images.unsplash.com/photo-1537984822441-cff3300a36a4?w=500&q=80', size: 204800, date: Date.now() / 1000 - 3600 }
          ]));
        } else if (req.method === 'POST') {
          // Fake upload response
          res.end(JSON.stringify({
            success: true,
            url: 'https://images.unsplash.com/photo-1611095973763-414019e72400?w=500&q=80',
            name: 'uploaded-mock.jpg'
          }));
        } else if (req.method === 'DELETE') {
          res.end(JSON.stringify({ success: true }));
        }
        return;
      }
      next();
    });
  }
});

const configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;

const configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	window.parent.postMessage({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	}, '*');
};
`;

const configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;

const configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/\.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;

const addTransformIndexHtml = {
	name: 'add-transform-index-html',
	transformIndexHtml(html) {
		return {
			html,
			tags: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsRuntimeErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsViteErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: {type: 'module'},
					children: configHorizonsConsoleErrroHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configWindowFetchMonkeyPatch,
					injectTo: 'head',
				},
			],
		};
	},
};

console.warn = () => {};

const logger = createLogger()
const loggerError = logger.error

logger.error = (msg, options) => {
	if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
		return;
	}

	loggerError(msg, options);
}

// Mock kullanmak istersen: set USE_MOCK=true && npm run dev
const useMock = process.env.USE_MOCK === 'true';

export default defineConfig({
	customLogger: logger,
	logLevel: 'info',
	plugins: [
		...(isDev ? [inlineEditPlugin(), editModeDevPlugin()] : []),
		react(),
		addTransformIndexHtml,
		...(useMock ? [mockApiPlugin()] : [])
	],
	server: {
		cors: true,
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
		},
		allowedHosts: true,
		// Canlı Hostinger sunucusuna proxy (gerçek veritabanı bağlantısı)
		proxy: {
			'/api': {
				target: 'https://www.firatotoyedekparca.com',
				changeOrigin: true,
				secure: true,
				cookieDomainRewrite: 'localhost',
				configure: (proxy, _options) => {
					proxy.on('proxyReq', (proxyReq, req, _res) => {
						// Origin header'ını canlı sunucu için ayarla (CORS bypass)
						proxyReq.setHeader('Origin', 'https://www.firatotoyedekparca.com');
						proxyReq.setHeader('Referer', 'https://www.firatotoyedekparca.com/');
					});
				}
			}
		},
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', ],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		minify: 'terser',
		sourcemap: false,
		reportCompressedSize: true,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: undefined,
				entryFileNames: 'assets/[name].[hash].js',
				chunkFileNames: 'assets/[name].[hash].js',
				assetFileNames: 'assets/[name].[hash].[ext]'
			},
			external: [
				'@babel/parser',
				'@babel/traverse',
				'@babel/generator',
				'@babel/types'
			]
		}
	}
});
