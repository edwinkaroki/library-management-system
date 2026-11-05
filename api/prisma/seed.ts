import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be set to seed the PostgreSQL database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log('Seeding library database...');

  // Seed Genres (At least 4 genres required)
  const genresData = [
    { name: 'Fiction', description: 'Literary and narrative works of fiction' },
    {
      name: 'Science Fiction',
      description:
        'Speculative fiction dealing with imaginative concepts like futuristic science, space exploration, and technology',
    },
    {
      name: 'Mystery & Thriller',
      description:
        'Suspenseful, crime-solving, and psychological thrillers full of intrigue',
    },
    {
      name: 'Non-Fiction',
      description:
        'Factual writing including memoirs, biographies, philosophy, and history',
    },
    {
      name: 'Fantasy',
      description:
        'Magical, mythological, and supernatural adventures in secondary worlds',
    },
  ];

  const genres: Record<string, string> = {};
  for (const genreData of genresData) {
    const genre = await prisma.genre.upsert({
      where: { name: genreData.name },
      update: { description: genreData.description },
      create: genreData,
    });
    genres[genre.name] = genre.id;
  }
  console.log(`Created/verified ${Object.keys(genres).length} genres.`);

  // Seed Users (Role enum: PATRON, LIBRARIAN)
  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@library.org' },
    update: {},
    create: {
      email: 'librarian@library.org',
      name: 'Sarah Jenkins',
      role: Role.LIBRARIAN,
    },
  });

  const patron1 = await prisma.user.upsert({
    where: { email: 'alice.reader@example.com' },
    update: {},
    create: {
      email: 'alice.reader@example.com',
      name: 'Alice Reader',
      role: Role.PATRON,
    },
  });

  const patron2 = await prisma.user.upsert({
    where: { email: 'bob.bookworm@example.com' },
    update: {},
    create: {
      email: 'bob.bookworm@example.com',
      name: 'Bob Bookworm',
      role: Role.PATRON,
    },
  });
  console.log('Created/verified users (1 Librarian, 2 Patrons).');

  // Seed Books (At least 15 books distributed across genres)
  const booksData = [
    // Fiction
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      publishedYear: 1960,
      availableCopies: 4,
      totalCopies: 5,
      genreName: 'Fiction',
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      publishedYear: 1925,
      availableCopies: 3,
      totalCopies: 3,
      genreName: 'Fiction',
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      publishedYear: 1949,
      availableCopies: 2,
      totalCopies: 4,
      genreName: 'Fiction',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '9780141439518',
      publishedYear: 1813,
      availableCopies: 5,
      totalCopies: 5,
      genreName: 'Fiction',
    },

    // Science Fiction
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441013593',
      publishedYear: 1965,
      availableCopies: 3,
      totalCopies: 4,
      genreName: 'Science Fiction',
    },
    {
      title: 'Neuromancer',
      author: 'William Gibson',
      isbn: '9780441569595',
      publishedYear: 1984,
      availableCopies: 2,
      totalCopies: 2,
      genreName: 'Science Fiction',
    },
    {
      title: 'Foundation',
      author: 'Isaac Asimov',
      isbn: '9780553293357',
      publishedYear: 1951,
      availableCopies: 4,
      totalCopies: 4,
      genreName: 'Science Fiction',
    },
    {
      title: 'Snow Crash',
      author: 'Neal Stephenson',
      isbn: '9780553380958',
      publishedYear: 1992,
      availableCopies: 1,
      totalCopies: 2,
      genreName: 'Science Fiction',
    },

    // Mystery & Thriller
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      isbn: '9780307949486',
      publishedYear: 2005,
      availableCopies: 3,
      totalCopies: 3,
      genreName: 'Mystery & Thriller',
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '9780307588371',
      publishedYear: 2012,
      availableCopies: 2,
      totalCopies: 3,
      genreName: 'Mystery & Thriller',
    },
    {
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      isbn: '9780307474278',
      publishedYear: 2003,
      availableCopies: 4,
      totalCopies: 4,
      genreName: 'Mystery & Thriller',
    },
    {
      title: 'And Then There Were None',
      author: 'Agatha Christie',
      isbn: '9780062073488',
      publishedYear: 1939,
      availableCopies: 3,
      totalCopies: 3,
      genreName: 'Mystery & Thriller',
    },

    // Non-Fiction
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
      publishedYear: 2011,
      availableCopies: 5,
      totalCopies: 6,
      genreName: 'Non-Fiction',
    },
    {
      title: 'Educated',
      author: 'Tara Westover',
      isbn: '9780399590504',
      publishedYear: 2018,
      availableCopies: 2,
      totalCopies: 3,
      genreName: 'Non-Fiction',
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '9780374533557',
      publishedYear: 2011,
      availableCopies: 3,
      totalCopies: 4,
      genreName: 'Non-Fiction',
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '9780735211292',
      publishedYear: 2018,
      availableCopies: 6,
      totalCopies: 6,
      genreName: 'Non-Fiction',
    },

    // Fantasy
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '9780547928227',
      publishedYear: 1937,
      availableCopies: 4,
      totalCopies: 5,
      genreName: 'Fantasy',
    },
    {
      title: 'A Game of Thrones',
      author: 'George R.R. Martin',
      isbn: '9780553593716',
      publishedYear: 1996,
      availableCopies: 2,
      totalCopies: 3,
      genreName: 'Fantasy',
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '9780756404741',
      publishedYear: 2007,
      availableCopies: 3,
      totalCopies: 4,
      genreName: 'Fantasy',
    },
  ];

  let insertedBooksCount = 0;
  const createdBooks = [];
  for (const item of booksData) {
    const { genreName, ...bookData } = item;
    const genreId = genres[genreName];
    if (!genreId) {
      throw new Error(`Genre not found: ${genreName}`);
    }

    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {
        title: bookData.title,
        author: bookData.author,
        publishedYear: bookData.publishedYear,
        availableCopies: bookData.availableCopies,
        totalCopies: bookData.totalCopies,
        genreId,
      },
      create: {
        ...bookData,
        genreId,
      },
    });
    createdBooks.push(book);
    insertedBooksCount++;
  }
  console.log(
    `Created/verified ${insertedBooksCount} books across ${Object.keys(genres).length} genres.`,
  );

  // Seed Reviews (Stretch Goal)
  const dune = createdBooks.find((b) => b.title === 'Dune');
  if (dune) {
    const reviewExists = await prisma.review.findFirst({
      where: { bookId: dune.id, userId: patron1.id },
    });
    if (!reviewExists) {
      await prisma.review.create({
        data: {
          bookId: dune.id,
          userId: patron1.id,
          rating: 5,
          comment:
            'A legendary sci-fi epic with rich politics and unforgettable world-building.',
        },
      });
      console.log('Added review for Dune.');
    }
  }

  const atomicHabits = createdBooks.find((b) => b.title === 'Atomic Habits');
  if (atomicHabits) {
    const reviewExists = await prisma.review.findFirst({
      where: { bookId: atomicHabits.id, userId: patron2.id },
    });
    if (!reviewExists) {
      await prisma.review.create({
        data: {
          bookId: atomicHabits.id,
          userId: patron2.id,
          rating: 5,
          comment:
            'Incredibly practical and insightful guide to building sustainable habits.',
        },
      });
      console.log('Added review for Atomic Habits.');
    }
  }

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
