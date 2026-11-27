import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Utilidades de datos aleatorios (para generar un volumen realista de
// registros de prueba: dueños, mascotas, citas, vacunas, tratamientos y
// baños/cortes). No usamos ninguna librería externa (como faker) para no
// agregar una dependencia nueva al proyecto.
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(options: { value: T; weight: number }[]): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * total;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return option.value;
  }
  return options[options.length - 1].value;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(num: number, size: number): string {
  return String(num).padStart(size, "0");
}

function sinTildes(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9.]/g, "");
}

function randomDateBetween(start: Date, end: Date): Date {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t);
}

const DIA_MS = 24 * 60 * 60 * 1000;

const NOMBRES_M = [
  "Carlos", "Luis", "Jose", "Juan", "Miguel", "Jorge", "Fernando", "Diego",
  "Ricardo", "Alberto", "Manuel", "Eduardo", "Francisco", "Rafael", "Sergio",
  "Victor", "Hugo", "Oscar", "Raul", "Cesar", "Martin", "Pablo", "Andres",
  "Gustavo", "Roberto", "Daniel", "Javier", "Alejandro", "Mario", "Enrique",
];

const NOMBRES_F = [
  "Maria", "Ana", "Rosa", "Carmen", "Patricia", "Claudia", "Sandra", "Lucia",
  "Gabriela", "Veronica", "Diana", "Pilar", "Silvia", "Teresa", "Monica",
  "Karina", "Daniela", "Fiorella", "Milagros", "Jazmin", "Yolanda", "Elena",
  "Isabel", "Carolina", "Paola", "Vanessa", "Katherine", "Ximena", "Sofia",
  "Valeria",
];

const APELLIDOS = [
  "Gonzales", "Perez", "Ramirez", "Flores", "Garcia", "Rodriguez", "Lopez",
  "Torres", "Diaz", "Vargas", "Castillo", "Romero", "Alvarez", "Mendoza",
  "Rojas", "Gutierrez", "Chavez", "Reyes", "Morales", "Ortiz", "Silva",
  "Cruz", "Nunez", "Herrera", "Medina", "Aguilar", "Campos", "Vega",
  "Salazar", "Carrasco", "Paredes", "Quispe", "Mamani", "Huaman", "Zavala",
  "Espinoza", "Guerrero", "Soto", "Leon", "Rivas",
];

const DOMINIOS_EMAIL = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com"];

const DISTRITOS = [
  "Lima", "Surco", "Miraflores", "San Isidro", "La Molina", "San Borja",
  "Barranco", "Chorrillos", "San Miguel", "Magdalena", "Jesus Maria",
  "Pueblo Libre", "Surquillo", "Comas", "Los Olivos",
  "San Juan de Lurigancho", "Ate", "Villa El Salvador",
];

const CALLES = [
  "Av. Los Pinos", "Jr. Las Flores", "Calle Las Begonias", "Av. Arequipa",
  "Jr. Cusco", "Av. La Marina", "Calle Los Alamos", "Jr. Amazonas",
  "Av. Primavera", "Calle Las Camelias", "Jr. Puno", "Av. Universitaria",
  "Calle Los Jazmines", "Jr. Junin", "Av. Brasil",
];

const PERRO_NOMBRES = [
  "Max", "Rocky", "Toby", "Firulais", "Simon", "Thor", "Zeus", "Bruno",
  "Oso", "Rex", "Duke", "Jack", "Leo", "Bobby", "Capitan", "Trueno",
  "Canela", "Nina", "Lola", "Coco", "Maya", "Princesa", "Bella", "Kiara",
  "Nala", "Chispa", "Pelusa", "Daisy", "Rufo", "Beethoven",
];

const GATO_NOMBRES = [
  "Michi", "Garfield", "Simba", "Tom", "Felix", "Salem", "Milo", "Oreo",
  "Kitty", "Whiskers", "Tigre", "Shadow", "Misha", "Pantera", "Mia",
  "Nube", "Toffee", "Minino", "Salem", "Manchas",
];

const OTROS_NOMBRES = [
  "Pipo", "Kiwi", "Nugget", "Bigotes", "Burbuja", "Palomo", "Spike", "Coco",
];

const RAZAS: Record<string, string[]> = {
  PERRO: [
    "Mestizo", "Golden Retriever", "Labrador", "Bulldog Frances",
    "Pastor Aleman", "Poodle", "Chihuahua", "Schnauzer", "Shih Tzu",
    "Husky Siberiano", "Beagle", "Pug", "Cocker Spaniel", "Pitbull",
    "Dalmata",
  ],
  GATO: ["Comun europeo", "Siames", "Persa", "Maine Coon", "Angora", "Bengala", "Mestizo"],
  AVE: ["Periquito", "Canario", "Loro", "Cacatua"],
  ROEDOR: ["Hamster", "Cuy", "Conejo", "Chinchilla"],
  REPTIL: ["Tortuga", "Iguana", "Gecko"],
  OTRO: ["No especificada"],
};

const COLORES = [
  "Negro", "Blanco", "Marron", "Dorado", "Gris", "Atigrado",
  "Blanco y negro", "Cafe", "Crema", "Manchado",
];

const VETERINARIOS = [
  "Dr. Fernando Loza", "Dra. Patricia Nuñez", "Dr. Jorge Salinas",
  "Dra. Carla Benavides", "Dr. Luis Mendoza",
];

const MOTIVOS_CITA = [
  "Control anual", "Vacunacion", "Consulta por vomitos", "Chequeo general",
  "Desparasitacion", "Consulta dermatologica", "Control de peso",
  "Revision post-operatoria", "Dolor articular", "Consulta por decaimiento",
  "Control de preñez", "Revision dental", "Consulta oftalmologica",
  "Corte de uñas y chequeo", "Emergencia - herida", "Consulta por alergia",
];

const VACUNAS_NOMBRES = [
  "Rabia", "Sextuple canina", "Triple felina", "Parvovirus", "Moquillo",
  "Leucemia felina", "Polivalente felina", "Bordetella", "Leptospirosis",
];

const DIAGNOSTICOS = [
  { d: "Otitis leve", desc: "Infeccion de oido, tratamiento con gotas oticas" },
  { d: "Dermatitis alergica", desc: "Reaccion alergica en la piel, posiblemente alimentaria" },
  { d: "Gastroenteritis", desc: "Inflamacion gastrointestinal con vomitos y diarrea" },
  { d: "Fractura de pata", desc: "Fractura leve tras caida, requiere inmovilizacion" },
  { d: "Parasitos intestinales", desc: "Presencia de parasitos detectada en examen de heces" },
  { d: "Conjuntivitis", desc: "Inflamacion ocular con secrecion" },
  { d: "Infeccion urinaria", desc: "Cistitis bacteriana, tratamiento antibiotico" },
  { d: "Displasia de cadera", desc: "Diagnostico por radiografia, seguimiento a largo plazo" },
  { d: "Problema dental", desc: "Sarro avanzado, requiere limpieza dental" },
  { d: "Neumonia leve", desc: "Infeccion respiratoria baja, en observacion" },
];

const GROOMING_TIPOS: { tipo: string; precio: number }[] = [
  { tipo: "BANO", precio: 45 },
  { tipo: "CORTE", precio: 35 },
  { tipo: "BANO_Y_CORTE", precio: 80 },
  { tipo: "DESLANADO", precio: 60 },
  { tipo: "CORTE_UNAS", precio: 20 },
];

const ENCARGADOS_GROOMING = ["Rosa Medina", "Jorge Salas", "Katherine Fiorella", "Mario Quispe"];

function nombreCompleto(): { nombres: string; apellidos: string } {
  const esHombre = Math.random() < 0.5;
  const nombres = esHombre ? pick(NOMBRES_M) : pick(NOMBRES_F);
  const apellidos = `${pick(APELLIDOS)} ${pick(APELLIDOS)}`;
  return { nombres, apellidos };
}

async function main() {
  console.log("🌱 Limpiando datos existentes...");
  await prisma.userPermission.deleteMany();
  await prisma.userLocation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.review.deleteMany();
  await prisma.grooming.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.location.deleteMany();

  console.log("👥 Creando usuarios del sistema...");
  const adminPasswordHash = await hashPassword("admin123");
  await prisma.user.create({
    data: {
      nombre: "Administrador VetCare",
      email: "admin@vetcare.pe",
      passwordHash: adminPasswordHash,
      rol: "ADMIN",
      // El admin no necesita filas en permisos: siempre tiene acceso total.
    },
  });

  const recepcionPasswordHash = await hashPassword("recepcion123");
  await prisma.user.create({
    data: {
      nombre: "Recepción",
      email: "recepcion@vetcare.pe",
      passwordHash: recepcionPasswordHash,
      rol: "STAFF",
      permisos: {
        create: [{ modulo: "duenos" }, { modulo: "mascotas" }, { modulo: "citas" }, { modulo: "inventario" }],
      },
    },
  });

  const groomerPasswordHash = await hashPassword("grooming123");
  await prisma.user.create({
    data: {
      nombre: "Peluquería",
      email: "grooming@vetcare.pe",
      passwordHash: groomerPasswordHash,
      rol: "STAFF",
      permisos: {
        create: [{ modulo: "grooming" }],
      },
    },
  });

  console.log("🏥 Creando sedes...");
  const sedeCentro = await prisma.location.create({
    data: {
      nombre: "VetCare Centro",
      direccion: "Av. Arequipa 1234",
      ciudad: "Lima",
      telefono: "01-4567890",
      email: "centro@vetcare.pe",
      horario: "Lun a Sáb 9:00 - 20:00",
      latitud: -12.0716,
      longitud: -77.0364,
      imagenUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800",
    },
  });

  const sedeSur = await prisma.location.create({
    data: {
      nombre: "VetCare Surco",
      direccion: "Av. Caminos del Inca 567",
      ciudad: "Lima",
      telefono: "01-2223344",
      email: "surco@vetcare.pe",
      horario: "Lun a Dom 9:00 - 19:00",
      latitud: -12.1352,
      longitud: -76.9927,
      imagenUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    },
  });

  const sedes = [sedeCentro, sedeSur];

  console.log("👩‍⚕️ Creando personal (10 usuarios, 5 por sede)...");
  const ROLES_STAFF = [
    { etiqueta: "Recepción", modulos: ["duenos", "mascotas", "citas"] },
    { etiqueta: "Veterinario", modulos: ["mascotas", "citas", "vacunas", "tratamientos"] },
    { etiqueta: "Peluquería", modulos: ["grooming"] },
    { etiqueta: "Enfermería", modulos: ["vacunas", "tratamientos"] },
    { etiqueta: "Almacén", modulos: ["inventario"] },
  ];
  const staffPasswordHash = await hashPassword("vetcare123");
  const emailsStaffUsados = new Set<string>(["admin@vetcare.pe", "recepcion@vetcare.pe", "grooming@vetcare.pe"]);

  for (let sedeIdx = 0; sedeIdx < sedes.length; sedeIdx++) {
    const sede = sedes[sedeIdx];
    for (let i = 0; i < 5; i++) {
      const { nombres, apellidos } = nombreCompleto();
      const rolInfo = ROLES_STAFF[i % ROLES_STAFF.length];
      let email = `${sinTildes(nombres)}.${sinTildes(apellidos.split(" ")[0])}.${sinTildes(sede.nombre.replace("VetCare ", ""))}@vetcare.pe`;
      let intento = 0;
      while (emailsStaffUsados.has(email)) {
        intento += 1;
        email = `${sinTildes(nombres)}.${sinTildes(apellidos.split(" ")[0])}${intento}.${sinTildes(sede.nombre.replace("VetCare ", ""))}@vetcare.pe`;
      }
      emailsStaffUsados.add(email);

      await prisma.user.create({
        data: {
          nombre: `${nombres} ${apellidos} (${rolInfo.etiqueta} - ${sede.nombre})`,
          email,
          passwordHash: staffPasswordHash,
          rol: "STAFF",
          permisos: { create: rolInfo.modulos.map((modulo) => ({ modulo })) },
          sedes: { create: [{ locationId: sede.id }] },
        },
      });
    }
  }

  console.log("👤 Creando 100 dueños...");
  const TOTAL_DUENOS = 100;
  const dnisUsados = new Set<string>();
  const emailsDuenoUsados = new Set<string>();
  const ownersInput: { nombres: string; apellidos: string; dni: string; telefono: string; email: string; direccion: string }[] = [];

  for (let i = 0; i < TOTAL_DUENOS; i++) {
    const { nombres, apellidos } = nombreCompleto();
    let dni = `4${pad(1000000 + i, 7)}`;
    while (dnisUsados.has(dni)) dni = `4${pad(randomInt(1000100, 9999999), 7)}`;
    dnisUsados.add(dni);

    const dominio = pick(DOMINIOS_EMAIL);
    let email = `${sinTildes(nombres)}.${sinTildes(apellidos.split(" ")[0])}${i}@${dominio}`;
    while (emailsDuenoUsados.has(email)) email = `${sinTildes(nombres)}.${sinTildes(apellidos.split(" ")[0])}${i}.${randomInt(1, 999)}@${dominio}`;
    emailsDuenoUsados.add(email);

    ownersInput.push({
      nombres,
      apellidos,
      dni,
      telefono: `9${pad(randomInt(0, 99999999), 8)}`,
      email,
      direccion: `${pick(CALLES)} ${randomInt(100, 1999)}, ${pick(DISTRITOS)}`,
    });
  }

  await prisma.owner.createMany({ data: ownersInput });
  const createdOwners = await prisma.owner.findMany({
    where: { dni: { in: ownersInput.map((o) => o.dni) } },
  });
  const dniToId = new Map(createdOwners.map((o) => [o.dni, o.id]));
  const owners = ownersInput.map((o) => ({ ...o, id: dniToId.get(o.dni)! }));

  console.log("🐾 Creando mascotas (al menos 100)...");
  const especieOptions: { value: string; weight: number }[] = [
    { value: "PERRO", weight: 50 },
    { value: "GATO", weight: 35 },
    { value: "AVE", weight: 6 },
    { value: "ROEDOR", weight: 6 },
    { value: "REPTIL", weight: 2 },
    { value: "OTRO", weight: 1 },
  ];

  const petsInput: {
    nombre: string; especie: string; raza: string; sexo: string;
    fechaNacimiento: Date; peso: number; color: string; esterilizado: boolean;
    duenoId: number;
  }[] = [];

  for (const owner of owners) {
    // La mayoría de dueños tiene 1 mascota; ~20% tiene 2, para superar
    // cómodamente el umbral de 100 mascotas sin que se vea artificial.
    const cantidadMascotas = Math.random() < 0.2 ? 2 : 1;
    const nombresUsadosPorDueno = new Set<string>();

    for (let m = 0; m < cantidadMascotas; m++) {
      const especie = pickWeighted(especieOptions);
      let nombre: string;
      if (especie === "PERRO") nombre = pick(PERRO_NOMBRES);
      else if (especie === "GATO") nombre = pick(GATO_NOMBRES);
      else nombre = pick(OTROS_NOMBRES);

      let intentos = 0;
      while (nombresUsadosPorDueno.has(nombre) && intentos < 10) {
        nombre = especie === "PERRO" ? pick(PERRO_NOMBRES) : especie === "GATO" ? pick(GATO_NOMBRES) : pick(OTROS_NOMBRES);
        intentos += 1;
      }
      nombresUsadosPorDueno.add(nombre);

      const edadAnios = randomInt(0, 12);
      const fechaNacimiento = new Date();
      fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - edadAnios);
      fechaNacimiento.setMonth(randomInt(0, 11));
      fechaNacimiento.setDate(randomInt(1, 28));

      const pesoBase = especie === "PERRO" ? randomInt(3, 40) : especie === "GATO" ? randomInt(2, 7) : randomInt(1, 5);

      petsInput.push({
        nombre,
        especie,
        raza: pick(RAZAS[especie]),
        sexo: Math.random() < 0.5 ? "MACHO" : "HEMBRA",
        fechaNacimiento,
        peso: Math.round((pesoBase + Math.random()) * 10) / 10,
        color: pick(COLORES),
        esterilizado: Math.random() < 0.6,
        duenoId: owner.id,
      });
    }
  }

  const createdPets: { id: number; especie: string }[] = [];
  for (const petData of petsInput) {
    const pet = await prisma.pet.create({ data: petData });
    createdPets.push({ id: pet.id, especie: pet.especie });
  }

  console.log(`   → ${createdPets.length} mascotas creadas.`);

  const hoy = new Date();
  const hace6Meses = new Date(hoy.getTime() - 180 * DIA_MS);
  const en2Meses = new Date(hoy.getTime() + 60 * DIA_MS);

  console.log("📅 Creando citas (al menos 100)...");
  const TOTAL_CITAS = 110;
  const citasInput = Array.from({ length: TOTAL_CITAS }, () => {
    const fecha = randomDateBetween(hace6Meses, en2Meses);
    const esPasada = fecha.getTime() < hoy.getTime();
    const estado = esPasada
      ? pickWeighted([
          { value: "COMPLETADA", weight: 75 },
          { value: "CANCELADA", weight: 15 },
          { value: "CONFIRMADA", weight: 10 },
        ])
      : pickWeighted([
          { value: "PENDIENTE", weight: 55 },
          { value: "CONFIRMADA", weight: 40 },
          { value: "CANCELADA", weight: 5 },
        ]);

    return {
      fecha,
      motivo: pick(MOTIVOS_CITA),
      veterinario: pick(VETERINARIOS),
      estado,
      mascotaId: pick(createdPets).id,
      sedeId: pick(sedes).id,
    };
  });
  await prisma.appointment.createMany({ data: citasInput });

  console.log("💉 Creando vacunas (al menos 100)...");
  const TOTAL_VACUNAS = 110;
  const vacunasInput = Array.from({ length: TOTAL_VACUNAS }, () => {
    const fechaAplicacion = randomDateBetween(hace6Meses, hoy);
    const proximaDosis = new Date(fechaAplicacion.getTime() + 365 * DIA_MS);
    return {
      nombre: pick(VACUNAS_NOMBRES),
      fechaAplicacion,
      proximaDosis,
      veterinario: pick(VETERINARIOS),
      lote: `${pick(["RB", "SC", "TF", "PV", "MQ", "LF"])}-${randomInt(1000, 9999)}`,
      mascotaId: pick(createdPets).id,
    };
  });
  await prisma.vaccine.createMany({ data: vacunasInput });

  console.log("🩺 Creando tratamientos (al menos 100)...");
  const TOTAL_TRATAMIENTOS = 110;
  const tratamientosInput = Array.from({ length: TOTAL_TRATAMIENTOS }, () => {
    const diag = pick(DIAGNOSTICOS);
    const fechaInicio = randomDateBetween(hace6Meses, hoy);
    const estado = pickWeighted([
      { value: "FINALIZADO", weight: 55 },
      { value: "EN_CURSO", weight: 35 },
      { value: "SUSPENDIDO", weight: 10 },
    ]);
    const fechaFin = estado === "FINALIZADO" ? new Date(fechaInicio.getTime() + randomInt(5, 30) * DIA_MS) : null;

    return {
      diagnostico: diag.d,
      descripcion: diag.desc,
      medicamentos: Math.random() < 0.8 ? "Según indicación veterinaria" : null,
      fechaInicio,
      fechaFin,
      veterinario: pick(VETERINARIOS),
      estado,
      mascotaId: pick(createdPets).id,
    };
  });
  await prisma.treatment.createMany({ data: tratamientosInput });

  console.log("✂️ Creando servicios de baño y corte (al menos 100)...");
  const TOTAL_GROOMING = 110;
  const groomingInput = Array.from({ length: TOTAL_GROOMING }, () => {
    const servicio = pick(GROOMING_TIPOS);
    const fecha = randomDateBetween(hace6Meses, en2Meses);
    return {
      tipoServicio: servicio.tipo,
      fecha,
      precio: servicio.precio + randomInt(-5, 10),
      encargado: pick(ENCARGADOS_GROOMING),
      mascotaId: pick(createdPets).id,
      sedeId: pick(sedes).id,
    };
  });
  await prisma.grooming.createMany({ data: groomingInput });

  console.log("📦 Creando inventario...");
  await prisma.inventoryItem.createMany({
    data: [
      {
        nombre: "Vacuna antirrábica",
        categoria: "Vacunas",
        stock: 18,
        stockMinimo: 5,
        precio: 45,
        proveedor: "Distribuidora VetPlus",
        ubicacion: "Almacén A",
        observaciones: "Lote especial para perros y gatos",
        fechaVencimiento: new Date("2027-05-15"),
      },
      {
        nombre: "Antibiótico oral",
        categoria: "Medicamentos",
        stock: 7,
        stockMinimo: 10,
        precio: 28.5,
        proveedor: "Farmacias Veterinarias del Sur",
        ubicacion: "Almacén B",
        observaciones: "Vigilar control de temperatura",
        fechaVencimiento: new Date("2026-12-20"),
      },
      {
        nombre: "Comida premium para perros",
        categoria: "Alimentos",
        stock: 25,
        stockMinimo: 8,
        precio: 62,
        proveedor: "NutriPet SAC",
        ubicacion: "Estante 1",
      },
    ],
  });

  console.log("⭐ Creando reseñas...");
  await prisma.review.createMany({
    data: [
      {
        calificacion: 5,
        comentario: "Excelente atención, el veterinario fue muy amable y profesional.",
        duenoId: owners[0].id,
        sedeId: sedeCentro.id,
      },
      {
        calificacion: 4,
        comentario: "Buen servicio, aunque la espera fue un poco larga.",
        duenoId: owners[1].id,
        sedeId: sedeSur.id,
      },
      {
        calificacion: 5,
        comentario: "Mi mascota quedó feliz después del baño, muy recomendado.",
        duenoId: owners[2].id,
        sedeId: sedeCentro.id,
      },
    ],
  });

  console.log("✅ Seed completado con éxito.");
  console.log(`   Dueños: ${owners.length} | Mascotas: ${createdPets.length} | Citas: ${TOTAL_CITAS} | Vacunas: ${TOTAL_VACUNAS} | Tratamientos: ${TOTAL_TRATAMIENTOS} | Baños/cortes: ${TOTAL_GROOMING}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
