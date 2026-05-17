/**Inyeccion de dependencias */
//* Es inyectar o añadir una dependencia a una clase, función o módulo sin que este tenga que crearla o
//*  gestionarla por sí mismo. Esto se hace para mejorar la modularidad, la reutilización y la testabilidad del código.

//* En TypeScript, la inyección de dependencias se puede lograr de varias maneras,
//* como a través de constructores, métodos o propiedades. Aquí hay un ejemplo simple utilizando la inyección de dependencias a través del constructor:

// ============================================================
// PASO 1: Definir el CONTRATO (interfaz)
// La clase que recibe la dependencia solo conoce este contrato,
// no sabe NI LE IMPORTA cuál implementación concreta recibe.
// ============================================================

interface Logger {
    log(message: string): void;
}

// ============================================================
// PASO 2: Crear implementaciones concretas del contrato
// Podemos tener varias — en tests usaremos una falsa,
// en producción usaremos la real.
// ============================================================

class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(`[ConsoleLogger] ${message}`);
    }
}

class FileLogger implements Logger {
    log(message: string): void {
        // Simula escribir en un archivo
        console.log(`[FileLogger] >> ${message} (guardado en archivo)`);
    }
}

// Logger falso para tests: no hace nada, solo registra las llamadas
class MockLogger implements Logger {
    public messages: string[] = [];

    log(message: string): void {
        this.messages.push(message);
    }
}

// ============================================================
// PASO 3: La clase que RECIBE la dependencia por el constructor
// Nunca hace `new ConsoleLogger()` adentro — eso la acoplaría.
// ============================================================

class UserService {
    // Recibe cualquier cosa que cumpla el contrato Logger
    constructor(private readonly logger: Logger) {}

    createUser(name: string): void {
        // Lógica de negocio...
        this.logger.log(`Usuario creado: ${name}`);
    }

    deleteUser(name: string): void {
        this.logger.log(`Usuario eliminado: ${name}`);
    }
}

// ============================================================
// PASO 4: El "ensamblador" — quien decide qué implementación usar.
// En NestJS este rol lo cumple el módulo + el contenedor IoC.
// ============================================================

console.log('--- Entorno PRODUCCIÓN ---');
const prodLogger  = new ConsoleLogger();
const prodService = new UserService(prodLogger);
prodService.createUser('Ana');
prodService.deleteUser('Pedro');

console.log('\n--- Entorno con FileLogger ---');
const fileLogger    = new FileLogger();
const fileService   = new UserService(fileLogger);
fileService.createUser('Luis');

console.log('\n--- Entorno TEST (sin efectos secundarios) ---');
const mockLogger   = new MockLogger();
const testService  = new UserService(mockLogger);
testService.createUser('Carlos');
testService.deleteUser('María');

// En un test real verificarías esto con expect():
console.log('Mensajes capturados por el mock:', mockLogger.messages);

// ============================================================
// BENEFICIOS CLAVE
// ✅  UserService no depende de ConsoleLogger, FileLogger ni Mock.
// ✅  Cambiar de logger = cambiar UNA línea en el ensamblador.
// ✅  Los tests no tocan la consola ni el disco.
// ✅  En NestJS reemplazas este ensamblador manual por @Injectable()
//     y el decorador @Module() — el framework inyecta solo.
// ============================================================
