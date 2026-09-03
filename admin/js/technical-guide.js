// technical-guide.js - Módulo de Guía Técnica para Desarrolladores y Administradores del PIA

export function initTechnicalGuide() {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <!-- HEADER DE NAVEGACIÓN TÉCNICA -->
        <div class="page-header" style="margin-bottom: 1.75rem; background: #fff; padding: 1.75rem 2rem; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(5,17,31,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 0.35rem 0.85rem; background: rgba(0, 194, 224, 0.12); color: var(--blue-bright, #2B82C9); border: 1px solid rgba(0, 194, 224, 0.3); border-radius: 50px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">
                        <i class="fas fa-code"></i> Documentación de Desarrollo & Arquitectura
                    </div>
                    <h1 style="font-family: var(--font-head); font-size: 1.8rem; font-weight: 800; color: var(--navy, #05111F); margin: 0 0 0.4rem 0;">
                        Guía Técnica del Sistema PIA
                    </h1>
                    <p style="color: var(--text-muted, #5E7A8E); font-size: 0.95rem; margin: 0; max-width: 820px; line-height: 1.5;">
                        Manual de arquitectura, stack tecnológico, endpoints de API REST, motores de datos JSON, matriz de seguridad, integración de IA (Lupita) y guía de mantenimiento para administradores y desarrolladores.
                    </p>
                </div>
                
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button id="btnPrintGuide" class="btn-guide-action" style="padding: 0.65rem 1.1rem; background: var(--surface, #F0F5FB); color: var(--navy, #05111F); border: 1px solid var(--border); border-radius: 12px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-print" style="color: var(--blue-bright);"></i> Imprimir / PDF
                    </button>
                    <button id="btnCopySysInfo" class="btn-guide-action" style="padding: 0.65rem 1.1rem; background: var(--navy, #05111F); color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-copy" style="color: var(--cyan);"></i> Copiar Ficha Técnica
                    </button>
                </div>
            </div>

            <!-- BUSCADOR INTERACTIVO & FILTROS DE CATEGORÍA -->
            <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 1rem;">
                <div style="position: relative; width: 100%;">
                    <i class="fas fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.95rem;"></i>
                    <input type="text" id="guideSearchInput" placeholder="Buscar en la guía técnica (ej. 'express', 'JWT', 'Lupita', 'backup', 'schema', 'push', 'json')..." style="width: 100%; padding: 0.8rem 1rem 0.8rem 2.75rem; background: var(--surface, #F0F5FB); border: 1px solid var(--border); border-radius: 12px; font-size: 0.92rem; color: var(--text-main); font-family: var(--font-body); transition: all 0.2s;">
                </div>

                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; scrollbar-width: thin;" id="guideTabContainer">
                    <button class="guide-tab-btn active" data-category="all"><i class="fas fa-th-large"></i> Todo (Visión General)</button>
                    <button class="guide-tab-btn" data-category="arch"><i class="fas fa-cubes"></i> Arquitectura & Stack</button>
                    <button class="guide-tab-btn" data-category="structure"><i class="fas fa-folder-tree"></i> Estructura de Proyecto</button>
                    <button class="guide-tab-btn" data-category="json"><i class="fas fa-database"></i> Motores de Datos JSON</button>
                    <button class="guide-tab-btn" data-category="api"><i class="fas fa-plug"></i> Catálogo API REST</button>
                    <button class="guide-tab-btn" data-category="security"><i class="fas fa-shield-alt"></i> Seguridad & RBAC</button>
                    <button class="guide-tab-btn" data-category="ai"><i class="fas fa-robot"></i> Asistente Lupita (IA)</button>
                    <button class="guide-tab-btn" data-category="push"><i class="fas fa-bell"></i> Push & Service Worker</button>
                    <button class="guide-tab-btn" data-category="deploy"><i class="fas fa-server"></i> Despliegue & Backups</button>
                </div>
            </div>
        </div>

        <!-- RESUMEN EJECUTIVO Y ESTADO DE COMPONENTES -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.75rem;">
            <div style="background: #fff; padding: 1.25rem 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
                    <i class="fab fa-node-js" style="color: #68a063; margin-right: 4px;"></i> Entorno de Ejecución
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--navy);">Node.js v20+ ESM</div>
                <div style="font-size: 0.8rem; color: #22C55E; font-weight: 600; margin-top: 0.25rem;"><i class="fas fa-check-circle"></i> Express 4.19 / REST API</div>
            </div>

            <div style="background: #fff; padding: 1.25rem 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
                    <i class="fas fa-database" style="color: var(--blue-bright); margin-right: 4px;"></i> Motor de Datos
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--navy);">Flat-File JSON</div>
                <div style="font-size: 0.8rem; color: #22C55E; font-weight: 600; margin-top: 0.25rem;"><i class="fas fa-lock"></i> Escritura Atómica & Auditada</div>
            </div>

            <div style="background: #fff; padding: 1.25rem 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
                    <i class="fas fa-brain" style="color: #8b5cf6; margin-right: 4px;"></i> IA Generativa (Lupita)
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--navy);">@google/genai 2.14</div>
                <div style="font-size: 0.8rem; color: #22C55E; font-weight: 600; margin-top: 0.25rem;"><i class="fas fa-check-circle"></i> Gemini 2.5 / RAG Context</div>
            </div>

            <div style="background: #fff; padding: 1.25rem 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
                    <i class="fas fa-shield-alt" style="color: var(--orange); margin-right: 4px;"></i> Seguridad & Control
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--navy);">JWT + Salt SHA-256</div>
                <div style="font-size: 0.8rem; color: #22C55E; font-weight: 600; margin-top: 0.25rem;"><i class="fas fa-shield-check"></i> RBAC + Audit Logger</div>
            </div>
        </div>

        <!-- SECCIONES DE LA GUÍA TÉCNICA -->
        <div id="guideSectionsWrapper" style="display: flex; flex-direction: column; gap: 1.75rem;">

            <!-- SECCIÓN 1: ARQUITECTURA GENERAL Y STACK TECNOLÓGICO -->
            <section class="guide-section-card" data-category="arch" id="sec-arch" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(0,194,224,0.12); color: var(--cyan); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-cubes"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">1. Arquitectura General y Stack Tecnológico</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Arquitectura desacoplada basada en microservicios livianos, archivos estáticos optimizados y API RESTful</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <h3 style="font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-desktop" style="color: var(--blue-bright);"></i> Capa de Presentación (Frontend)
                        </h3>
                        <ul style="list-style: none; font-size: 0.88rem; color: var(--text-main); display: flex; flex-direction: column; gap: 0.5rem; padding: 0;">
                            <li><strong>• HTML5 Semántico:</strong> Estructura accesible con soporte para lectores de pantalla e i18n.</li>
                            <li><strong>• CSS3 Modular & Variables:</strong> Tema con variables en <code>:root</code>, sistema responsive grid/flexbox y transiciones fluidas de vista (<code>View Transitions API</code>).</li>
                            <li><strong>• JavaScript Vanilla (ES Modules):</strong> Sin frameworks pesados; módulos nativos reutilizables en cliente para máxima velocidad.</li>
                            <li><strong>• Motores Gráficos WebGL2 / Canvas:</strong> Efecto <code>createMoltenMetalEffect</code> para tarjetas 3D en Home y gráficos interactivos con Chart.js/Recharts.</li>
                            <li><strong>• Service Worker & PWA:</strong> Cacheamiento de assets estáticos y registro de notificaciones Web Push activas (<code>data-service-worker.js</code>).</li>
                        </ul>
                    </div>

                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <h3 style="font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-server" style="color: var(--cyan);"></i> Capa Servidora & Servicios (Backend)
                        </h3>
                        <ul style="list-style: none; font-size: 0.88rem; color: var(--text-main); display: flex; flex-direction: column; gap: 0.5rem; padding: 0;">
                            <li><strong>• Node.js v20+ ESM:</strong> Ejecución nativa de JavaScript moderno con sintaxis de <code>import/export</code>.</li>
                            <li><strong>• Express.js 4.19:</strong> Ruteo RESTful, parseo JSON/URLencoded de hasta 50MB y gestión de archivos estáticos.</li>
                            <li><strong>• Persistence Engine:</strong> Persistencia plana en archivos JSON en disco con manejo seguro de concurrencia y respaldos.</li>
                            <li><strong>• SDK Gemini AI (@google/genai):</strong> Conexión nativa de servidor con modelos Gemini para asistente ciudadano Lupita.</li>
                            <li><strong>• Contenedor Cloud Run:</strong> Despliegue en contenedor con puerto expuesto **3000** detrás de proxy inverso Nginx.</li>
                        </ul>
                    </div>
                </div>

                <div style="background: #05111F; color: #E8EDF5; padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(0,194,224,0.25);">
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--cyan); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-terminal"></i> Comando de Inicio y Scripts de Producción (<code>package.json</code>)
                    </div>
                    <pre style="margin: 0; background: rgba(0,0,0,0.4); padding: 0.85rem 1rem; border-radius: 8px; font-family: monospace; font-size: 0.85rem; color: #38d6f0; overflow-x: auto;">
npm run dev    # Inicia el servidor de desarrollo en Node.js (server.js) en puerto 3000
npm start      # Comando estándar de producción para Cloud Run / Servidor
                    </pre>
                </div>
            </section>

            <!-- SECCIÓN 2: ESTRUCTURA DE DIRECTORIOS Y ARCHIVOS -->
            <section class="guide-section-card" data-category="structure" id="sec-structure" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(43,130,201,0.12); color: var(--blue-bright); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-folder-tree"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">2. Estructura Completa del Proyecto</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Mapa de archivos, módulos del portal y componentes clave de la aplicación</p>
                    </div>
                </div>

                <div style="background: #0C2033; color: #F0F5FB; padding: 1.5rem; border-radius: 14px; font-family: monospace; font-size: 0.88rem; line-height: 1.6; overflow-x: auto; border: 1px solid rgba(0,194,224,0.2);">
<span style="color: #00C2E0;">/ (Raíz del Proyecto)</span>
├── <span style="color: #22C55E;">server.js</span>                        <span style="color: #94A3B8;"># Servidor Express, API REST, Auth JWT, Gemini AI, Bitácoras y Push</span>
├── <span style="color: #22C55E;">package.json</span>                     <span style="color: #94A3B8;"># Configuración de dependencias (Express, @google/genai) y scripts</span>
├── <span style="color: #22C55E;">index.html</span>                       <span style="color: #94A3B8;"># Portal Público Principal (Carrusel WebGL, Buscador y Asistente Lupita)</span>
├── <span style="color: #22C55E;">users.json</span>                       <span style="color: #94A3B8;"># Base de datos de Usuarios Administradores (Contraseñas cifradas + Roles)</span>
├── <span style="color: #22C55E;">security_policies.json</span>           <span style="color: #94A3B8;"># Políticas de seguridad (Complejidad clave, Rate limits, Inactividad)</span>
├── <span style="color: #22C55E;">audit_logs.json</span>                  <span style="color: #94A3B8;"># Bitácora oficial de auditoría con IP, acción, timestamp y prev/new values</span>
├── <span style="color: #22C55E;">chatbot_knowledge.json</span>           <span style="color: #94A3B8;"># Base de Conocimiento entrenable del Asistente Virtual Lupita</span>
├── <span style="color: #22C55E;">chatbot_settings.json</span>            <span style="color: #94A3B8;"># Configuración del bot (Nombre, prompt del sistema, tono y modelo AI)</span>
├── <span style="color: #22C55E;">data_portal.json</span>                 <span style="color: #94A3B8;"># Métricas globales de uso y tráfico del portal</span>
│
├── <span style="color: #38BDF8;">/admin/</span>                          <span style="color: #94A3B8;"># Panel de Administración de Datos (SPA Autenticada)</span>
│   ├── <span style="color: #22C55E;">index.html</span>                   <span style="color: #94A3B8;"># Vista SPA del Administrador con layout responsive y menú de módulos</span>
│   ├── <span style="color: #38BDF8;">/css/</span>                        <span style="color: #94A3B8;"># Estilos del panel (admin.css, database-manager.css)</span>
│   └── <span style="color: #38BDF8;">/js/</span>                         <span style="color: #94A3B8;"># Lógica modular JS del administrador:</span>
│       ├── <span style="color: #F97316;">app.js</span>                   <span style="color: #94A3B8;"># Controlador central, ruteo SPA, gestión de inactividad y menú</span>
│       ├── <span style="color: #F97316;">auth.js</span>                  <span style="color: #94A3B8;"># Verificación de tokens JWT y envío de credenciales</span>
│       ├── <span style="color: #F97316;">crud.js</span>                  <span style="color: #94A3B8;"># Motor dinámico de tablas CRUD para edición de registros</span>
│       ├── <span style="color: #F97316;">form-builder.js</span>          <span style="color: #94A3B8;"># Generador dinámico de formularios según esquemas</span>
│       ├── <span style="color: #F97316;">user-manager.js</span>          <span style="color: #94A3B8;"># Gestor de usuarios, roles y políticas de seguridad</span>
│       ├── <span style="color: #F97316;">chatbot-manager.js</span>       <span style="color: #94A3B8;"># Panel de administración de Lupita (Entrenamiento RAG y Logs)</span>
│       ├── <span style="color: #F97316;">database-manager.js</span>      <span style="color: #94A3B8;"># Gestor de respaldos JSON, restauración y visor raw</span>
│       └── <span style="color: #F97316;">technical-guide.js</span>      <span style="color: #94A3B8;"># Módulo de Guía Técnica para Administradores y Desarrolladores</span>
│
├── <span style="color: #38BDF8;">/canales-por-la-integridad/</span>      <span style="color: #94A3B8;"># Módulo de Canales de Integridad y Denuncias</span>
│   ├── <span style="color: #22C55E;">index.html</span>                   <span style="color: #94A3B8;"># Interfaz de consulta de mecanismos de integridad</span>
│   └── <span style="color: #22C55E;">data_directorio.json</span>         <span style="color: #94A3B8;"># Base de datos de canales institucionales y contactos</span>
│
├── <span style="color: #38BDF8;">/directorio/</span>                     <span style="color: #94A3B8;"># Módulo Directorio Acceso al Ejecutivo</span>
│   ├── <span style="color: #22C55E;">index.html</span>                   <span style="color: #94A3B8;"># Buscador de autoridades y fichas de funcionarios</span>
│   └── <span style="color: #22C55E;">data_acceso.json</span>             <span style="color: #94A3B8;"># Base de datos de ministerios, secretarías y autoridades</span>
│
├── <span style="color: #38BDF8;">/gobierno_en_numeros/</span>            <span style="color: #94A3B8;"># Módulo Tu Gobierno en Números</span>
│   ├── <span style="color: #22C55E;">index.html</span>                   <span style="color: #94A3B8;"># Visualizador de tableros estadísticos y glosario</span>
│   └── <span style="color: #22C55E;">data_tableros.json</span>           <span style="color: #94A3B8;"># Base de datos de indicadores presupuestarios y proyectos</span>
│
├── <span style="color: #38BDF8;">/riesgo/</span>                         <span style="color: #94A3B8;"># Módulo Riesgo en la Mira</span>
│   ├── <span style="color: #22C55E;">index.html</span>                   <span style="color: #94A3B8;"># Portal de análisis de riesgos de corrupción</span>
│   └── <span style="color: #22C55E;">datos.json</span>                   <span style="color: #94A3B8;"># Matriz de riesgos, semáforos e instituciones monitoreadas</span>
│
├── <span style="color: #38BDF8;">/vehiculos/</span>                      <span style="color: #94A3B8;"># Módulo Transparencia Vehicular</span>
│   ├── <span style="color: #22C55E;">index.html</span>                   <span style="color: #94A3B8;"># Buscador de placa vehicular oficial y parque público</span>
│   └── <span style="color: #22C55E;">vehiculos.json</span>               <span style="color: #94A3B8;"># Registro oficial del parque vehicular del Estado</span>
│
├── <span style="color: #38BDF8;">/js/</span>                             <span style="color: #94A3B8;"># Scripts compartidos en portal público</span>
│   ├── <span style="color: #22C55E;">pia-chatbot.js</span>               <span style="color: #94A3B8;"># Widget flotante del asistente virtual Lupita</span>
│   └── <span style="color: #22C55E;">sw-register.js</span>               <span style="color: #94A3B8;"># Registro e integración con Service Worker Push</span>
└── <span style="color: #22C55E;">data-service-worker.js</span>           <span style="color: #94A3B8;"># Service Worker para notificaciones push en segundo plano</span>
                </div>
            </section>

            <!-- SECCIÓN 3: MOTORES DE DATOS JSON -->
            <section class="guide-section-card" data-category="json" id="sec-json" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(34,197,94,0.12); color: #22C55E; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-database"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">3. Motores de Datos JSON (Mapeo de Tablas Planas)</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Persistencia plana estructurada en archivos JSON de alta velocidad</p>
                    </div>
                </div>

                <p style="font-size: 0.92rem; color: var(--text-main); margin-bottom: 1.25rem;">
                    El Portal de Integridad Activa utiliza un motor de almacenamiento en archivos plana **JSON** respaldado por <code>fs</code> en Node.js. Esto garantiza independencia de bases de datos relacionales externas, facilísima migración y respaldos instantáneos mediante copia física o snapshots.
                </p>

                <div style="overflow-x: auto; margin-bottom: 1.5rem;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left;">
                        <thead>
                            <tr style="background: var(--navy); color: #fff; font-family: var(--font-head);">
                                <th style="padding: 0.85rem 1rem; border-radius: 8px 0 0 0;">Módulo en Panel</th>
                                <th style="padding: 0.85rem 1rem;">Ruta del Archivo JSON</th>
                                <th style="padding: 0.85rem 1rem;">Campos Clave del Registro</th>
                                <th style="padding: 0.85rem 1rem; border-radius: 0 8px 0 0;">Acciones Auditadas</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--navy);"><i class="fas fa-comments" style="color: var(--cyan);"></i> Canales x Integridad</td>
                                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--blue-bright);">/canales-por-la-integridad/data_directorio.json</td>
                                <td style="padding: 0.85rem 1rem;"><code>id</code>, <code>institucion</code>, <code>mecanismo</code>, <code>telefono</code>, <code>email</code>, <code>url</code></td>
                                <td style="padding: 0.85rem 1rem;"><span class="badge-audit" style="background: rgba(34,197,94,0.12); color: #22C55E; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Alta, Edición, Baja</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border); background: var(--surface);">
                                <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--navy);"><i class="fas fa-address-book" style="color: var(--blue-bright);"></i> Directorio Ejecutivo</td>
                                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--blue-bright);">/directorio/data_acceso.json</td>
                                <td style="padding: 0.85rem 1rem;"><code>id</code>, <code>nombre</code>, <code>cargo</code>, <code>entidad</code>, <code>contacto</code>, <code>direccion</code></td>
                                <td style="padding: 0.85rem 1rem;"><span class="badge-audit" style="background: rgba(34,197,94,0.12); color: #22C55E; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Alta, Edición, Baja</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--navy);"><i class="fas fa-chart-bar" style="color: #22C55E;"></i> Gobierno en Números</td>
                                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--blue-bright);">/gobierno_en_numeros/data_tableros.json</td>
                                <td style="padding: 0.85rem 1rem;"><code>id</code>, <code>titulo</code>, <code>categoria</code>, <code>monto</code>, <code>estado</code>, <code>avance</code></td>
                                <td style="padding: 0.85rem 1rem;"><span class="badge-audit" style="background: rgba(34,197,94,0.12); color: #22C55E; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Alta, Edición, Baja</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border); background: var(--surface);">
                                <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--navy);"><i class="fas fa-bullseye" style="color: var(--orange);"></i> Riesgo en la Mira</td>
                                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--blue-bright);">/riesgo/datos.json</td>
                                <td style="padding: 0.85rem 1rem;"><code>id</code>, <code>entidad</code>, <code>nivel_riesgo</code>, <code>indicadores</code>, <code>hallazgos</code></td>
                                <td style="padding: 0.85rem 1rem;"><span class="badge-audit" style="background: rgba(34,197,94,0.12); color: #22C55E; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Alta, Edición, Baja</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--navy);"><i class="fas fa-car" style="color: var(--cyan);"></i> Transparencia Vehicular</td>
                                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--blue-bright);">/vehiculos/vehiculos.json</td>
                                <td style="padding: 0.85rem 1rem;"><code>id</code>, <code>placa</code>, <code>marca</code>, <code>modelo</code>, <code>institucion</code>, <code>estado</code></td>
                                <td style="padding: 0.85rem 1rem;"><span class="badge-audit" style="background: rgba(34,197,94,0.12); color: #22C55E; padding: 2px 8px; border-radius: 6px; font-weight: 700;">Alta, Edición, Baja</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border); background: var(--surface);">
                                <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--navy);"><i class="fas fa-users-cog" style="color: #8b5cf6;"></i> Usuarios Administradores</td>
                                <td style="padding: 0.85rem 1rem; font-family: monospace; color: var(--blue-bright);">/users.json</td>
                                <td style="padding: 0.85rem 1rem;"><code>id</code>, <code>username</code>, <code>email</code>, <code>passwordHash</code>, <code>salt</code>, <code>role</code>, <code>modules</code></td>
                                <td style="padding: 0.85rem 1rem;"><span class="badge-audit" style="background: rgba(239,68,68,0.12); color: var(--red); padding: 2px 8px; border-radius: 6px; font-weight: 700;">Superadmin Solamente</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- SECCIÓN 4: CATÁLOGO API REST -->
            <section class="guide-section-card" data-category="api" id="sec-api" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(0,194,224,0.12); color: var(--cyan); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-plug"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">4. Catálogo de Endpoints de la API REST</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Rutas del servidor HTTP Express para autenticación, CRUD de módulos y servicios avanzadas</p>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                    <!-- Endpoint 1 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: #22C55E; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">POST</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/auth/login</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Autentica usuario con credenciales en <code>users.json</code> y genera token JWT de sesión.</div>
                        <span style="font-size: 0.75rem; background: rgba(0,194,224,0.15); color: var(--blue-bright); padding: 3px 8px; border-radius: 6px; font-weight: 600;">Público</span>
                    </div>

                    <!-- Endpoint 2 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: var(--blue-bright); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">GET</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/data/:module</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Retorna la colección completa de registros formateada en JSON del módulo especificado.</div>
                        <span style="font-size: 0.75rem; background: rgba(0,194,224,0.15); color: var(--blue-bright); padding: 3px 8px; border-radius: 6px; font-weight: 600;">Público / Autenticado</span>
                    </div>

                    <!-- Endpoint 3 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: #22C55E; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">POST</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/data/:module</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Agrega un nuevo registro al módulo especificado y genera evento de auditoría.</div>
                        <span style="font-size: 0.75rem; background: rgba(239,68,68,0.15); color: var(--red); padding: 3px 8px; border-radius: 6px; font-weight: 700;">Requiere Auth JWT</span>
                    </div>

                    <!-- Endpoint 4 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: var(--orange); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">PUT</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/data/:module/:id</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Actualiza un registro por ID y guarda los valores anteriores y nuevos en la bitácora.</div>
                        <span style="font-size: 0.75rem; background: rgba(239,68,68,0.15); color: var(--red); padding: 3px 8px; border-radius: 6px; font-weight: 700;">Requiere Auth JWT</span>
                    </div>

                    <!-- Endpoint 5 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: var(--red); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">DELETE</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/data/:module/:id</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Elimina de forma permanente un registro del archivo JSON asignado con registro de baja.</div>
                        <span style="font-size: 0.75rem; background: rgba(239,68,68,0.15); color: var(--red); padding: 3px 8px; border-radius: 6px; font-weight: 700;">Requiere Auth JWT</span>
                    </div>

                    <!-- Endpoint 6 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: #8b5cf6; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">POST</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/chatbot/ask</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Procesa preguntas de la ciudadanía usando Gemini AI + Contexto RAG del Portal.</div>
                        <span style="font-size: 0.75rem; background: rgba(0,194,224,0.15); color: var(--blue-bright); padding: 3px 8px; border-radius: 6px; font-weight: 600;">Público</span>
                    </div>

                    <!-- Endpoint 7 -->
                    <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: var(--blue-bright); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace;">GET</span>
                            <code style="font-size: 0.95rem; font-weight: 700; color: var(--navy);">/api/audit</code>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Retorna el historial filtrado de la bitácora oficial de auditoría de seguridad.</div>
                        <span style="font-size: 0.75rem; background: rgba(239,68,68,0.15); color: var(--red); padding: 3px 8px; border-radius: 6px; font-weight: 700;">Auditor / Admin</span>
                    </div>
                </div>
            </section>

            <!-- SECCIÓN 5: SEGURIDAD, AUTENTICACIÓN Y ROLES -->
            <section class="guide-section-card" data-category="security" id="sec-security" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(239,68,68,0.12); color: var(--red); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">5. Sistema de Seguridad, Autenticación y RBAC</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Control de acceso granular por roles, cifrado de contraseñas y auditoría en tiempo real</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <div style="font-weight: 700; color: var(--navy); margin-bottom: 0.5rem;"><i class="fas fa-key" style="color: var(--orange);"></i> Hash de Contraseñas</div>
                        <p style="font-size: 0.88rem; color: var(--text-main); margin: 0; line-height: 1.5;">
                            Las claves se almacenan cifradas en <code>users.json</code> usando derivación <strong>PBKDF2 / SHA-256</strong> con sal aleatoria generada dinámicamente por usuario, previniendo ataques de tabla de arcoíris.
                        </p>
                    </div>

                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <div style="font-weight: 700; color: var(--navy); margin-bottom: 0.5rem;"><i class="fas fa-hourglass-half" style="color: var(--blue-bright);"></i> Temporizador de Inactividad</div>
                        <p style="font-size: 0.88rem; color: var(--text-main); margin: 0; line-height: 1.5;">
                            El panel monitorea continuamente eventos de ratón y teclado. Tras <strong>30 minutos de inactividad</strong>, la sesión se expira automáticamente con borrado de token JWT en cliente por razones de seguridad.
                        </p>
                    </div>

                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <div style="font-weight: 700; color: var(--navy); margin-bottom: 0.5rem;"><i class="fas fa-file-invoice" style="color: #22C55E;"></i> Bitácora de Auditoría Completa</div>
                        <p style="font-size: 0.88rem; color: var(--text-main); margin: 0; line-height: 1.5;">
                            Toda acción de creación, actualización o eliminación en cualquier JSON queda registrada en <code>audit_logs.json</code> almacenando IP, usuario, rol, timestamp exacto y diff del registro.
                        </p>
                    </div>
                </div>

                <div style="background: rgba(12,32,51,0.03); border: 1px solid var(--border); padding: 1.25rem; border-radius: 14px;">
                    <h3 style="font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.75rem;"><i class="fas fa-id-badge"></i> Matriz de Roles del Sistema</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div style="background: #fff; padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-weight: 800; color: var(--navy); font-size: 0.92rem;"><i class="fas fa-crown" style="color: #f59e0b;"></i> Super Administrador</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Control absoluto de módulos, usuarios, roles, políticas de seguridad y motor de base de datos.</div>
                        </div>
                        <div style="background: #fff; padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-weight: 800; color: var(--navy); font-size: 0.92rem;"><i class="fas fa-user-cog" style="color: var(--blue-bright);"></i> Admin de Módulo</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Gestión de alta, edición y baja exclusiva para los catálogos de módulos que le fueron asignados.</div>
                        </div>
                        <div style="background: #fff; padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-weight: 800; color: var(--navy); font-size: 0.92rem;"><i class="fas fa-pen" style="color: #22C55E;"></i> Editor de Contenido</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Edición y modificación de registros existentes con aprobación o revisión de datos.</div>
                        </div>
                        <div style="background: #fff; padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
                            <div style="font-weight: 800; color: var(--navy); font-size: 0.92rem;"><i class="fas fa-search" style="color: #8b5cf6;"></i> Auditor de Seguridad</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Acceso exclusivo de lectura al Dashboard y módulo de Bitácora de Auditoría oficial.</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SECCIÓN 6: ASISTENTE VIRTUAL LUPITA (GEMINI AI) -->
            <section class="guide-section-card" data-category="ai" id="sec-ai" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(139,92,246,0.12); color: #8b5cf6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">6. Asistente Virtual Inteligente (Lupita - Gemini AI)</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Integración de Inteligencia Artificial Generativa con RAG y entrenamiento en tiempo real</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.25rem;">
                    <div>
                        <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1rem;">
                            Lupita es el asistente ciudadano impulsado por la librería oficial <code>@google/genai</code>. Combina el modelo **Gemini 2.5 Flash** con fragmentos de contexto extraídos de <code>chatbot_knowledge.json</code> para responder inquietudes sobre denuncias, directorio de autoridades, vehículos oficiales e indicadores presupuestarios.
                        </p>

                        <div style="background: var(--surface); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border);">
                            <div style="font-weight: 700; color: var(--navy); font-size: 0.88rem; margin-bottom: 0.4rem;">
                                <i class="fas fa-sliders-h" style="color: #8b5cf6;"></i> Configuración del Modelo
                            </div>
                            <ul style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.2rem; margin: 0; display: flex; flex-direction: column; gap: 0.3rem;">
                                <li>Modelo por defecto: <code>gemini-2.5-flash</code></li>
                                <li>API Key server-side: <code>process.env.GEMINI_API_KEY</code></li>
                                <li>Manejo de reintentos y respuestas fallback ante imprevistos de red.</li>
                            </ul>
                        </div>
                    </div>

                    <div style="background: #05111F; color: #E8EDF5; padding: 1.25rem; border-radius: 14px; font-size: 0.85rem;">
                        <div style="color: var(--cyan); font-weight: 700; margin-bottom: 0.5rem;"><i class="fas fa-code"></i> Fragmento del Handler Express (<code>server.js</code>)</div>
                        <pre style="margin: 0; background: rgba(0,0,0,0.4); padding: 0.85rem; border-radius: 8px; font-family: monospace; color: #a5b4fc; overflow-x: auto;">
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

app.post('/api/chatbot/ask', async (req, res) => {
    const { question } = req.body;
    const knowledge = readJsonFile('chatbot_knowledge.json');
    const prompt = buildRAGPrompt(question, knowledge);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    res.json({ answer: response.text });
});
                        </pre>
                    </div>
                </div>
            </section>

            <!-- SECCIÓN 7: NOTIFICACIONES PUSH Y SERVICE WORKER -->
            <section class="guide-section-card" data-category="push" id="sec-push" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(249,115,22,0.12); color: var(--orange); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">7. Sistema de Notificaciones Push y Service Worker</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Canal directo de difusión institucional en navegadores y dispositivos móviles</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <div style="font-weight: 700; color: var(--navy); margin-bottom: 0.4rem;"><i class="fas fa-id-card" style="color: var(--orange);"></i> Claves VAPID & Subscripciones</div>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
                            Las alertas push operan mediante el protocolo Web Push con par de claves VAPID públicas/privadas. El navegador registra la suscripción en el Service Worker <code>data-service-worker.js</code>.
                        </p>
                    </div>

                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <div style="font-weight: 700; color: var(--navy); margin-bottom: 0.4rem;"><i class="fas fa-bullhorn" style="color: var(--blue-bright);"></i> Difusión Masiva (Broadcast)</div>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
                            Los administradores pueden emitir alertas institucionales a todos los ciudadanos suscritos directamente desde el botón **"Enviar Push Notificación"** disponible en los módulos principales del panel.
                        </p>
                    </div>
                </div>
            </section>

            <!-- SECCIÓN 8: DESPLIEGUE, MANTENIMIENTO Y RESPALDOS -->
            <section class="guide-section-card" data-category="deploy" id="sec-deploy" style="background: #fff; border-radius: var(--radius-lg, 20px); border: 1px solid var(--border); padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem; border-bottom: 2px solid var(--surface); padding-bottom: 1rem;">
                    <div style="width: 42px; height: 42px; background: rgba(5,17,31,0.12); color: var(--navy); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                        <i class="fas fa-server"></i>
                    </div>
                    <div>
                        <h2 style="font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; color: var(--navy); margin: 0;">8. Despliegue, Mantenimiento y Procedimientos de Respaldo</h2>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Guía operativa para administradores de infraestructura y mantenimiento continuo</p>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <h3 style="font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem;"><i class="fas fa-download" style="color: var(--blue-bright);"></i> Procedimiento de Copia de Seguridad (Backup Snapshot)</h3>
                        <ol style="font-size: 0.88rem; color: var(--text-main); padding-left: 1.2rem; margin: 0; display: flex; flex-direction: column; gap: 0.4rem;">
                            <li>Navegue al módulo <strong>"Motores de Datos JSON"</strong> en el menú lateral.</li>
                            <li>Haga clic en el botón <strong>"Descargar Respaldo JSON Completo"</strong>.</li>
                            <li>El sistema empaquetará la totalidad de los archivos de datos (<code>.json</code>) con marca de tiempo.</li>
                            <li>Conserve la copia descargada en un almacenamiento seguro o bóveda institucional.</li>
                        </ol>
                    </div>

                    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
                        <h3 style="font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem;"><i class="fas fa-upload" style="color: #22C55E;"></i> Procedimiento de Restauración de Emergencia</h3>
                        <ol style="font-size: 0.88rem; color: var(--text-main); padding-left: 1.2rem; margin: 0; display: flex; flex-direction: column; gap: 0.4rem;">
                            <li>Acceda al módulo <strong>"Motores de Datos JSON"</strong> con rol de Super Administrador.</li>
                            <li>Seleccione la opción <strong>"Restaurar desde Respaldo"</strong> e ingrese el archivo JSON.</li>
                            <li>Confirme la operación; la bitácora registrará el evento de restauración de emergencia con timestamp e IP del administrador responsable.</li>
                        </ol>
                    </div>
                </div>
            </section>
        </div>
    `;

    // AGREGAR ESTILOS DINÁMICOS PARA LAS PESTAÑAS Y SECCIONES
    if (!document.getElementById('tech-guide-styles')) {
        const style = document.createElement('style');
        style.id = 'tech-guide-styles';
        style.textContent = `
            .guide-tab-btn {
                padding: 0.5rem 1rem;
                background: var(--surface, #F0F5FB);
                color: var(--text-muted, #5E7A8E);
                border: 1px solid var(--border);
                border-radius: 30px;
                font-weight: 700;
                font-size: 0.82rem;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .guide-tab-btn:hover {
                background: rgba(0, 194, 224, 0.1);
                color: var(--blue-bright, #2B82C9);
                border-color: rgba(0, 194, 224, 0.3);
            }
            .guide-tab-btn.active {
                background: var(--navy, #05111F);
                color: var(--cyan, #00C2E0);
                border-color: var(--navy, #05111F);
                box-shadow: 0 4px 12px rgba(5,17,31,0.15);
            }
            .btn-guide-action:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            @media print {
                .sidebar, .top-header, .page-header button, #guideSearchInput, #guideTabContainer {
                    display: none !important;
                }
                .guide-section-card {
                    break-inside: avoid;
                    box-shadow: none !important;
                    border: 1px solid #ccc !important;
                    margin-bottom: 2rem !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // LISTENER DE PESTAÑAS DE CATEGORÍA
    const tabs = document.querySelectorAll('.guide-tab-btn');
    const cards = document.querySelectorAll('.guide-section-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const cat = tab.dataset.category;
            cards.forEach(card => {
                if (cat === 'all' || card.dataset.category === cat) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // BUSCADOR EN TIEMPO REAL DENTRO DE LA GUÍA TÉCNICA
    const searchInput = document.getElementById('guideSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Si hay búsqueda, seleccionar la pestaña "Todo"
            if (query.length > 0) {
                tabs.forEach(t => t.classList.remove('active'));
                const allTab = document.querySelector('.guide-tab-btn[data-category="all"]');
                if (allTab) allTab.classList.add('active');
            }

            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // BOTÓN IMPRIMIR / PDF
    const btnPrint = document.getElementById('btnPrintGuide');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // BOTÓN COPIAR FICHA TÉCNICA
    const btnCopy = document.getElementById('btnCopySysInfo');
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const summaryText = `
PORTAL DE INTEGRIDAD ACTIVA (PIA) — FICHA TÉCNICA
==================================================
Stack Tecnológico: Node.js v20+ ESM, Express 4.19, @google/genai 2.14
Frontend: Vanilla JS ES Modules, HTML5, CSS3 Custom Properties, WebGL2 Shader Engine
Servidor HTTP: Node.js Express expuesto en Puerto 3000 (Cloud Run Container)
Almacenamiento: Motores de Datos JSON (Flat-Files) con Auditoría
Seguridad: Auth JWT, Hash SHA-256 + Salt PBKDF2, Temporizador Inactividad 30min, RBAC
IA Generativa: Asistente Virtual Lupita con Gemini 2.5 Flash + Contexto RAG
Servicios Adicionales: Web Push API + Service Worker (data-service-worker.js)
            `.trim();

            navigator.clipboard.writeText(summaryText).then(() => {
                if (typeof window.showToast === 'function') {
                    window.showToast('Ficha técnica copiada al portapapeles', 'success');
                } else {
                    alert('Ficha técnica copiada al portapapeles.');
                }
            }).catch(() => {
                alert('No se pudo copiar la ficha técnica.');
            });
        });
    }
}
