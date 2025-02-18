import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';
import https from 'https';
import http from 'http';
import formidable from "formidable";
import path from "path";

// Fungsi untuk membaca file SQL dan mengekstrak skema
const parseSQLFile = (filePath: string) => {
    const sql = fs.readFileSync(filePath, 'utf8');
    const tables: Record<string, { name: string; type: string }[]> = {};
    const foreignKeys: { table: string; field: string[]; references: { table: string; field: string[] } }[] = [];

    const createTableRegex = /CREATE TABLE `?(\w+)`?\s*\(([^)]+)\)/g;
    let match;

    while ((match = createTableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const columns = match[2].split(',').map(col => col.trim());
        
        tables[tableName] = columns.map(column => {
            const parts = column.split(' ');
            return {
                name: parts[0].replace(/`/g, ''),
                type: parts[1]
            };
        });
    }

    const foreignKeyRegex = /ALTER TABLE `?(\w+)`?\s+ADD CONSTRAINT `?\w+`? FOREIGN KEY \(([^)]+)\) REFERENCES `?(\w+)`?\(([^)]+)\)/g;

    while ((match = foreignKeyRegex.exec(sql)) !== null) {
        foreignKeys.push({
            table: match[1],
            field: match[2].split(',').map(f => f.trim()),
            references: {
                table: match[3],
                field: match[4].split(',').map(f => f.trim())
            }
        });
    }

    return { tables, foreignKeys };
};


// API route handler
export const config = {
    api: {
        bodyParser: false, // Disable Next.js body parsing
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        const filePath = path.join(process.cwd(), 'new_rekap_vany.sql');


        try {
            const sql = fs.readFileSync(filePath, "utf8")

            const lines = sql.split('\n');
            const data = {};
            const tables = {} as any;
            let tableDefinition = '';
    
            let currentTable:null | string = null;

            lines.forEach(line => {
                // Mengabaikan komentar dan baris kosong
                if (line.startsWith('--') || line.trim() === '') return;


                // const createTableRegex = /^CREATE TABLE (\w+) \((.*?)\);/;
                const createTableRegex = /CREATE TABLE `?(\w+)`?\s*\((.*)/i;
                const match = line.match(createTableRegex);                

                if(match){                    
                    currentTable = match[1]
                    const columns = match[2].split(',').map(col => col.trim());
                    console.log(columns)
                }

                // const match = line.match(createTableRegex);
                // // console.log({line, match})


                // if(match){
                //     currentTable = match[1]
                //     const columns = match[2].split(',').map(col => col.trim());

                //     // Mengambil nilai dari perintah INSERT
                //     const values = line.split('VALUES')[1].trim();
                //     const valueSets = values.slice(1, -2).split('),('); // Menghapus tanda kurung dan memisahkan set nilai

          
                //     // if (!data[currentTable]) {
                //     //   data[currentTable] = [];
                //     // }
                // }

            })
        
    

        } catch (error) {
            
        }
     

        // const { url } = req.body;

        // if (!url) {
        //     return res.status(400).json({ error: 'URL is required' });
        // }

        //  const filePath = './temp.sql'; // Temporary file path
        //  const file = fs.createWriteStream(filePath);
 
        //  const request = url.startsWith('https') ? https.get : http.get;


        //  request(url, response => {
        //     response.pipe(file);

        //     file.on('finish', async () => {
        //         file.close(); // Close the file after writing

        //         try {
        //             const result = parseSQLFile(filePath);
        //             console.log(result, "data")
        //             res.status(200).json({message:"OK"});
        //         } catch (error:any) {
        //             res.status(500).json({ error: error?.message });
        //         }

        //         // Remove the file after processing (optional)
        //         fs.unlinkSync(filePath);
        //     });
        // }).on('error', err => {
        //     fs.unlinkSync(filePath); // Delete the temp file on error
        //     res.status(500).json({ error: 'Error downloading the file' });
        // });

        //  res.status(200).json({message:"OK"})

    }
}

export default handler