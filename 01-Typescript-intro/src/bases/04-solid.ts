// ================================================================
//  PRINCIPIOS SOLID
// ================================================================
//* SOLID es un acrónimo de 5 principios de diseño orientado a
//* objetos que hacen el código más mantenible, escalable y testeable.
//*
//*  S — Single Responsibility  (Responsabilidad Única)
//*  O — Open/Closed            (Abierto/Cerrado)
//*  L — Liskov Substitution    (Sustitución de Liskov) → ver 03-
//*  I — Interface Segregation  (Segregación de Interfaces)
//*  D — Dependency Inversion   (Inversión de Dependencias)

// ================================================================
//  S — SINGLE RESPONSIBILITY PRINCIPLE (SRP)
// ================================================================
//* "Una clase debe tener una, y solo una, razón para cambiar."
//*
//* Si una clase hace demasiadas cosas, cualquier cambio en una
//* de ellas puede romper las otras. Separa responsabilidades.

// ❌ MAL: UserService hace TODO — lógica, validación, email y logs
class UserServiceBAD {
    createUser(name: string, email: string): void {
        // Validación
        if (!email.includes('@')) throw new Error('Email inválido');

        // Persistencia
        console.log(`Guardando ${name} en la base de datos...`);

        // Envío de email
        console.log(`Enviando email de bienvenida a ${email}...`);

        // Log
        console.log(`[LOG] Usuario ${name} creado.`);
    }
}

// ✅ BIEN: cada clase tiene UNA sola responsabilidad
class UserValidator {
    validate(email: string): void {
        if (!email.includes('@')) throw new Error('Email inválido');
    }
}

class UserRepository {
    save(name: string): void {
        console.log(`[DB] Guardando usuario: ${name}`);
    }
}

class EmailService {
    sendWelcome(email: string): void {
        console.log(`[Email] Bienvenida enviada a: ${email}`);
    }
}

class AppLogger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
}

//* UserService ahora solo ORQUESTA — no implementa nada directamente.
class UserServiceGOOD {
    constructor(
        private validator:  UserValidator,
        private repository: UserRepository,
        private mailer:     EmailService,
        private logger:     AppLogger,
    ) {}

    createUser(name: string, email: string): void {
        this.validator.validate(email);
        this.repository.save(name);
        this.mailer.sendWelcome(email);
        this.logger.log(`Usuario ${name} creado.`);
    }
}

const srp = new UserServiceGOOD(
    new UserValidator(),
    new UserRepository(),
    new EmailService(),
    new AppLogger(),
);
srp.createUser('Ana', 'ana@mail.com');


// ================================================================
//  O — OPEN/CLOSED PRINCIPLE (OCP)
// ================================================================
//* "El código debe estar ABIERTO para extensión y CERRADO para
//*  modificación."
//*
//* Agrega comportamiento nuevo sin tocar el código que ya funciona.

// ❌ MAL: cada nuevo tipo de descuento obliga a modificar esta función
function getDiscountBAD(type: string, price: number): number {
    if (type === 'regular')   return price * 0.1;
    if (type === 'vip')       return price * 0.2;
    // Si añado 'premium' debo MODIFICAR esta función → peligroso
    return 0;
}

// ✅ BIEN: extendemos agregando nuevas clases, sin tocar las existentes
interface DiscountStrategy {
    calculate(price: number): number;
}

class RegularDiscount implements DiscountStrategy {
    calculate(price: number): number { return price * 0.1; }
}

class VipDiscount implements DiscountStrategy {
    calculate(price: number): number { return price * 0.2; }
}

//* Para agregar "premium" solo creo una clase nueva. Nada existente cambia.
class PremiumDiscount implements DiscountStrategy {
    calculate(price: number): number { return price * 0.35; }
}

class PriceCalculator {
    //* Recibe la estrategia — no sabe cuál es, y no necesita saberlo.
    getDiscount(price: number, strategy: DiscountStrategy): number {
        return strategy.calculate(price);
    }
}

const calculator = new PriceCalculator();
console.log(calculator.getDiscount(100, new RegularDiscount())); // 10
console.log(calculator.getDiscount(100, new VipDiscount()));     // 20
console.log(calculator.getDiscount(100, new PremiumDiscount())); // 35


// ================================================================
//  I — INTERFACE SEGREGATION PRINCIPLE (ISP)
// ================================================================
//* "Un cliente no debe verse obligado a implementar interfaces
//*  que no usa."
//*
//* Prefiere varias interfaces pequeñas y específicas a una
//* interfaz grande y genérica.

// ❌ MAL: una interfaz monolítica obliga a implementar TODO
interface WorkerBAD {
    work(): void;
    eat(): void;
    sleep(): void;
}

//* Un robot tiene que implementar eat() y sleep() aunque no los use.
class RobotBAD implements WorkerBAD {
    work(): void  { console.log('Robot trabajando'); }
    eat(): void   { /* no aplica */ }   // ← forzado
    sleep(): void { /* no aplica */ }   // ← forzado
}

// ✅ BIEN: interfaces pequeñas y específicas
interface Workable  { work(): void;  }
interface Eatable   { eat(): void;   }
interface Sleepable { sleep(): void; }

//* El robot solo implementa lo que realmente puede hacer.
class RobotGOOD implements Workable {
    work(): void { console.log('Robot trabajando'); }
}

//* El humano implementa las tres porque las necesita todas.
class Human implements Workable, Eatable, Sleepable {
    work(): void  { console.log('Humano trabajando'); }
    eat(): void   { console.log('Humano comiendo');   }
    sleep(): void { console.log('Humano durmiendo');  }
}

const robot = new RobotGOOD();
const human = new Human();
robot.work();
human.eat();


// ================================================================
//  D — DEPENDENCY INVERSION PRINCIPLE (DIP)
// ================================================================
//* "Los módulos de alto nivel no deben depender de módulos de
//*  bajo nivel. Ambos deben depender de abstracciones."
//*
//* En otras palabras: depende de INTERFACES, no de clases concretas.
//* Este principio es la base de la Inyección de Dependencias (ver 02-).

// ❌ MAL: OrderService depende DIRECTAMENTE de MySQLDatabase
class MySQLDatabase {
    save(data: string): void {
        console.log(`[MySQL] Guardando: ${data}`);
    }
}

class OrderServiceBAD {
    //* Si quiero cambiar a PostgreSQL debo MODIFICAR OrderService.
    private db = new MySQLDatabase(); // acoplamiento duro

    createOrder(product: string): void {
        this.db.save(product);
    }
}

// ✅ BIEN: ambos dependen de la abstracción `Database`
interface Database {
    save(data: string): void;
}

class MySQL implements Database {
    save(data: string): void {
        console.log(`[MySQL] Guardando: ${data}`);
    }
}

class PostgreSQL implements Database {
    save(data: string): void {
        console.log(`[PostgreSQL] Guardando: ${data}`);
    }
}

class InMemoryDatabase implements Database {
    save(data: string): void {
        console.log(`[InMemory] Guardando: ${data}`);
    }
}

//* OrderService ni sabe ni le importa qué base de datos usa.
class OrderServiceGOOD {
    constructor(private readonly db: Database) {}

    createOrder(product: string): void {
        this.db.save(product);
    }
}

//* Cambiar de base de datos = cambiar UNA línea en el ensamblador.
const orderMySQL    = new OrderServiceGOOD(new MySQL());
const orderPostgres = new OrderServiceGOOD(new PostgreSQL());
const orderTest     = new OrderServiceGOOD(new InMemoryDatabase());

orderMySQL.createOrder('Laptop');
orderPostgres.createOrder('Teclado');
orderTest.createOrder('Mouse');

// ================================================================
//  RESUMEN — Cuándo aplica cada principio
// ================================================================
//*  S → Tu clase hace demasiadas cosas distintas → sepárala.
//*  O → Añadir un caso nuevo obliga a editar código viejo → usa estrategia/herencia.
//*  L → Un subtipo rompe el comportamiento del padre → usa composición o interfaz.
//*  I → Implementas métodos que no usas → divide la interfaz.
//*  D → Instancias clases concretas dentro de otras clases → inyecta la abstracción.
