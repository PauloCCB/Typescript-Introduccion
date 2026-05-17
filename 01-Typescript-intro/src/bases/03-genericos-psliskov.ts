// ================================================================
//  TEMA 1: GENÉRICOS (Generics)
// ================================================================
//* Un genérico es un "molde" que puede trabajar con CUALQUIER tipo
//* sin perder la seguridad de tipos que ofrece TypeScript.
//* Se declara con <T> (o cualquier letra/nombre) y se concreta
//* en el momento de usar la función, clase o interfaz.

// ----------------------------------------------------------------
// 1.1 Función genérica — el caso más simple
// ----------------------------------------------------------------

//* Sin genérico necesitarías una función por cada tipo,
//* o usar `any` y perder la ayuda del compilador.
function identity<T>(value: T): T {
    return value;
}

console.log(identity<number>(42));        // 42
console.log(identity<string>('hola'));    // "hola"
console.log(identity<boolean>(true));     // true

// ----------------------------------------------------------------
// 1.2 Genérico en arrays — trabajar con colecciones tipadas
// ----------------------------------------------------------------

function getFirst<T>(items: T[]): T {
    return items[0];
}

console.log(getFirst<number>([10, 20, 30]));     // 10
console.log(getFirst<string>(['a', 'b', 'c']));  // "a"

// ----------------------------------------------------------------
// 1.3 Restricción de genérico con `extends`
// Solo aceptamos tipos que tengan la propiedad `length`
// ----------------------------------------------------------------

function logLength<T extends { length: number }>(value: T): void {
    console.log(`Longitud: ${value.length}`);
}

logLength('Hola mundo');   // string tiene .length
logLength([1, 2, 3, 4]);   // array tiene .length
// logLength(42);           // ❌ Error: number no tiene .length

// ----------------------------------------------------------------
// 1.4 Clase genérica — una caja que guarda cualquier tipo
// ----------------------------------------------------------------

class Box<T> {
    private content: T;

    constructor(value: T) {
        this.content = value;
    }

    getValue(): T {
        return this.content;
    }

    setValue(value: T): void {
        this.content = value;
    }
}

const numberBox = new Box<number>(100);
console.log(numberBox.getValue()); // 100

const stringBox = new Box<string>('TypeScript');
console.log(stringBox.getValue()); // "TypeScript"

// ----------------------------------------------------------------
// 1.5 Repositorio genérico — patrón muy usado en NestJS
// Cada entidad (User, Product…) tiene su propio repositorio
// pero comparten la misma lógica CRUD.
// ----------------------------------------------------------------

interface Entity {
    id: number;
}

class GenericRepository<T extends Entity> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    findById(id: number): T | undefined {
        return this.items.find(item => item.id === id);
    }

    findAll(): T[] {
        return [...this.items];
    }
}

interface User extends Entity {
    name: string;
    email: string;
}

interface Product extends Entity {
    name: string;
    price: number;
}

const userRepo = new GenericRepository<User>();
userRepo.add({ id: 1, name: 'Ana', email: 'ana@mail.com' });
userRepo.add({ id: 2, name: 'Luis', email: 'luis@mail.com' });
console.log(userRepo.findById(1)); // { id: 1, name: 'Ana', ... }

const productRepo = new GenericRepository<Product>();
productRepo.add({ id: 1, name: 'Laptop', price: 1200 });
console.log(productRepo.findAll());


// ================================================================
//  TEMA 2: PRINCIPIO DE SUSTITUCIÓN DE LISKOV (LSP)
// ================================================================
//* "Si S es un subtipo de T, entonces los objetos de tipo T pueden
//*  ser reemplazados por objetos de tipo S sin alterar el
//*  funcionamiento correcto del programa."
//*                                        — Barbara Liskov, 1987
//*
//* En palabras simples: una clase hija debe poder SUSTITUIR a su
//* padre en cualquier contexto sin romper nada ni cambiar
//* el comportamiento esperado.

// ----------------------------------------------------------------
// 2.1 VIOLACIÓN de Liskov — el clásico ejemplo Rectángulo/Cuadrado
// ----------------------------------------------------------------

class Rectangle {
    constructor(
        protected width: number,
        protected height: number,
    ) {}

    setWidth(w: number): void  { this.width  = w; }
    setHeight(h: number): void { this.height = h; }
    area(): number { return this.width * this.height; }
}

//* Un cuadrado ES-UN rectángulo matemáticamente, pero en código
//* viola LSP porque CAMBIA el comportamiento del padre.
class Square extends Rectangle {
    constructor(side: number) {
        super(side, side);
    }

    //* PROBLEMA: cuando sobreescribo setWidth también cambio height,
    //* algo que Rectangle NUNCA hace. El consumidor no lo espera.
    override setWidth(w: number): void  { this.width  = w; this.height = w; }
    override setHeight(h: number): void { this.height = h; this.width  = h; }
}

function printArea(shape: Rectangle): void {
    shape.setWidth(5);
    shape.setHeight(10);
    // El consumidor espera 5 × 10 = 50 siempre
    console.log(`Área esperada 50, obtenida: ${shape.area()}`);
}

printArea(new Rectangle(1, 1)); // ✅  Área esperada 50, obtenida: 50
printArea(new Square(1));       // ❌  Área esperada 50, obtenida: 100  ← LSP roto

// ----------------------------------------------------------------
// 2.2 SOLUCIÓN — usar abstracción en lugar de herencia forzada
// ----------------------------------------------------------------

interface Shape {
    area(): number;
}

class Rect implements Shape {
    constructor(private w: number, private h: number) {}
    area(): number { return this.w * this.h; }
}

class Sqr implements Shape {
    constructor(private side: number) {}
    area(): number { return this.side * this.side; }
}

//* Ahora la función trabaja con el contrato `Shape`.
//* Cualquier implementación puede sustituir a otra sin romper nada.
function printShapeArea(shape: Shape): void {
    console.log(`Área: ${shape.area()}`);
}

printShapeArea(new Rect(5, 10)); // ✅ Área: 50
printShapeArea(new Sqr(5));      // ✅ Área: 25

// ----------------------------------------------------------------
// 2.3 LSP aplicado con genéricos — la combinación poderosa
// ----------------------------------------------------------------

//* Una función genérica respeta LSP de forma natural:
//* acepta cualquier subtipo sin necesitar saber cuál es.

function processShapes<T extends Shape>(shapes: T[]): void {
    shapes.forEach(s => console.log(`Procesando forma con área: ${s.area()}`));
}

processShapes([new Rect(3, 4), new Sqr(5)]); // ✅ ambos cumplen el contrato
