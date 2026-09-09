import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpiando datos existentes...");
  await prisma.review.deleteMany();
  await prisma.grooming.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.location.deleteMany();

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

  console.log("👤 Creando dueños...");
  const dueno1 = await prisma.owner.create({
    data: {
      nombres: "María",
      apellidos: "Gonzáles Ruiz",
      dni: "45678912",
      telefono: "987654321",
      email: "maria.gonzales@example.com",
      direccion: "Jr. Las Flores 123, Lima",
    },
  });

  const dueno2 = await prisma.owner.create({
    data: {
      nombres: "Carlos",
      apellidos: "Pérez Torres",
      dni: "41234567",
      telefono: "912345678",
      email: "carlos.perez@example.com",
      direccion: "Av. Los Pinos 456, Surco",
    },
  });

  const dueno3 = await prisma.owner.create({
    data: {
      nombres: "Ana",
      apellidos: "Ramírez Soto",
      dni: "48765432",
      telefono: "998877665",
      email: "ana.ramirez@example.com",
      direccion: "Calle Las Begonias 789, Miraflores",
    },
  });

  console.log("🐶 Creando mascotas...");
  const luna = await prisma.pet.create({
    data: {
      nombre: "Luna",
      especie: "PERRO",
      raza: "Golden Retriever",
      sexo: "HEMBRA",
      fechaNacimiento: new Date("2022-03-15"),
      peso: 24.5,
      color: "Dorado",
      esterilizado: true,
      duenoId: dueno1.id,
    },
  });

  const max = await prisma.pet.create({
    data: {
      nombre: "Max",
      especie: "PERRO",
      raza: "Bulldog Francés",
      sexo: "MACHO",
      fechaNacimiento: new Date("2021-07-01"),
      peso: 12.2,
      color: "Atigrado",
      esterilizado: false,
      duenoId: dueno2.id,
    },
  });

  const michi = await prisma.pet.create({
    data: {
      nombre: "Michi",
      especie: "GATO",
      raza: "Común europeo",
      sexo: "HEMBRA",
      fechaNacimiento: new Date("2023-01-20"),
      peso: 3.8,
      color: "Blanco y negro",
      esterilizado: true,
      duenoId: dueno3.id,
    },
  });

  const rocky = await prisma.pet.create({
    data: {
      nombre: "Rocky",
      especie: "PERRO",
      raza: "Pastor Alemán",
      sexo: "MACHO",
      fechaNacimiento: new Date("2020-05-10"),
      peso: 32,
      color: "Negro y café",
      esterilizado: true,
      duenoId: dueno1.id,
    },
  });

  console.log("📅 Creando citas...");
  await prisma.appointment.createMany({
    data: [
      {
        fecha: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        motivo: "Control anual",
        veterinario: "Dr. Fernando Loza",
        estado: "CONFIRMADA",
        mascotaId: luna.id,
        sedeId: sedeCentro.id,
      },
      {
        fecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        motivo: "Vómitos y decaimiento",
        veterinario: "Dra. Patricia Nuñez",
        estado: "PENDIENTE",
        mascotaId: max.id,
        sedeId: sedeSur.id,
      },
      {
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        motivo: "Vacunación",
        veterinario: "Dr. Fernando Loza",
        estado: "COMPLETADA",
        mascotaId: michi.id,
        sedeId: sedeCentro.id,
      },
      {
        fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        motivo: "Chequeo de cadera",
        veterinario: "Dra. Patricia Nuñez",
        estado: "PENDIENTE",
        mascotaId: rocky.id,
        sedeId: sedeSur.id,
      },
    ],
  });

  console.log("💉 Creando vacunas...");
  await prisma.vaccine.createMany({
    data: [
      {
        nombre: "Rabia",
        fechaAplicacion: new Date("2026-06-01"),
        proximaDosis: new Date("2027-06-01"),
        veterinario: "Dr. Fernando Loza",
        lote: "RB-2201",
        mascotaId: luna.id,
      },
      {
        nombre: "Séxtuple canina",
        fechaAplicacion: new Date("2026-08-10"),
        proximaDosis: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        veterinario: "Dra. Patricia Nuñez",
        lote: "SC-0091",
        mascotaId: max.id,
      },
      {
        nombre: "Triple felina",
        fechaAplicacion: new Date("2026-07-22"),
        proximaDosis: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        veterinario: "Dr. Fernando Loza",
        lote: "TF-3341",
        mascotaId: michi.id,
      },
    ],
  });

  console.log("🩺 Creando tratamientos...");
  await prisma.treatment.createMany({
    data: [
      {
        diagnostico: "Otitis leve",
        descripcion: "Infección de oído izquierdo, tratamiento con gotas óticas",
        medicamentos: "Otomax, 2 gotas cada 12h por 7 días",
        fechaInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        veterinario: "Dr. Fernando Loza",
        estado: "EN_CURSO",
        mascotaId: rocky.id,
      },
      {
        diagnostico: "Dermatitis alérgica",
        descripcion: "Reacción alérgica en la piel, posiblemente alimentaria",
        medicamentos: "Apoquel 16mg 1 vez al día por 14 días",
        fechaInicio: new Date("2026-05-01"),
        fechaFin: new Date("2026-05-15"),
        veterinario: "Dra. Patricia Nuñez",
        estado: "FINALIZADO",
        mascotaId: max.id,
      },
    ],
  });

  console.log("✂️ Creando servicios de baño y corte...");
  await prisma.grooming.createMany({
    data: [
      {
        tipoServicio: "BANO_Y_CORTE",
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        precio: 80,
        encargado: "Rosa Medina",
        mascotaId: luna.id,
        sedeId: sedeCentro.id,
      },
      {
        tipoServicio: "BANO",
        fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        precio: 45,
        encargado: "Jorge Salas",
        mascotaId: max.id,
        sedeId: sedeSur.id,
      },
      {
        tipoServicio: "CORTE_UNAS",
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        precio: 20,
        encargado: "Rosa Medina",
        mascotaId: michi.id,
        sedeId: sedeCentro.id,
      },
    ],
  });

  console.log("⭐ Creando reseñas...");
  await prisma.review.createMany({
    data: [
      {
        calificacion: 5,
        comentario: "Excelente atención, el veterinario fue muy amable y profesional.",
        duenoId: dueno1.id,
        sedeId: sedeCentro.id,
      },
      {
        calificacion: 4,
        comentario: "Buen servicio, aunque la espera fue un poco larga.",
        duenoId: dueno2.id,
        sedeId: sedeSur.id,
      },
      {
        calificacion: 5,
        comentario: "Mi gata quedó feliz después del baño, muy recomendado.",
        duenoId: dueno3.id,
        sedeId: sedeCentro.id,
      },
    ],
  });

  console.log("✅ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
