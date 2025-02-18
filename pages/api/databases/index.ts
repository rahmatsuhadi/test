
import prisma from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, type, host, username, password, port } = req.body;

    try {
      const database = await prisma.database.create({
        data: {
          name,
          type,
          host,
          username,
          password, // Pertimbangkan untuk mengenkripsi password
          port,
        },
      });

      res.status(201).json(database);
    } catch (error) {
      res.status(500).json({ error: 'Database creation failed' });
    }
  } else if (req.method === 'GET') {
    try {
      const databases = await prisma.database.findMany();
      res.status(200).json(databases);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch databases' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
