import { Database, Field, Relation, RelationType, Table } from "@prisma/client";
import axios from "axios";



const api = axios.create({
  baseURL: "/v2", // Ganti dengan URL API Anda
});


const schema = axios.create({
  baseURL: "/v2/schema", // Ganti dengan URL API Anda
});

// Schema APi



export const findDatabasesAll = async ()=>{
  const response= await schema.get<{data:Database[], total:number, skip:number, limit:number}>("/");
  return response.data;
}

export const finDatabaseById = async(id:string) =>{
  const response = await schema.get<Database>("/" + id);
  return response.data
}
export const deleteDatabaseById = async(id:string) =>{
  const response = await schema.delete<Database>("/" + id)
  return response.data
}
export const updateDatabaseById = async(id:string, updateData: Partial<Database>) =>{
  const response = await schema.patch<Database>("/" + id)
  return response.data
}

export const migrateDatabaseById = async (id: string) => {
  const response = await schema.get<Database>("/" + id + "/migrate");
  return response.data;
};

// table 

export const findTablesAll = async(databaseId:string) => {
  const response = await schema.get<{data:Table[], limit:number, skip:number, total:number}>("/" + databaseId )
  return response.data
}

export interface IFormCreateTable extends Omit<Table, "id"| "createdAt">{
  columns: Omit<Field, "id"| "createdAt" | "tableId">[]
}

export const createTable = async (databaseId:string, form:IFormCreateTable) =>{
  const response = await schema.post<Table>("/" + databaseId ,form)
  return response.data
}

export const findTableByName = async(databaseId:string, tableName:string) =>{
  const response = await schema.get<{data:Field[], skip:number,limit:number, total:number}>("/" + databaseId + "/" + tableName)
  return response.data
}

export const updateTableName = async(databaseId:string, tableName:string, newTableName:string) =>{
  const response = await schema.post<Table>("/" + databaseId + "/" + tableName,{name:tableName})
  return response.data
}

export const deleteTableById = async(databaseId:string, tableName:string) =>{
  const response = await schema.delete<Table>("/" + databaseId + "/" + tableName)
  return response.data
}

// column fields

export type IFieldRelation = Field & { relationsA: Array<{ tableB: Table; fieldB: Field }>} ;

export const findColumnAll =async(databaseId:string, tableName:string) =>{
  const response = await schema.get<{data:IFieldRelation[], total:number, skip:number, limit:number}>("/" + databaseId  + "/" + tableName);
  return response.data
}

export const findColumnById =async(databaseId:string, tableName:string, columnId:string) =>{
  const response = await schema.get<Field[]>("/" + databaseId  + "/" + tableName + "/" + columnId);
  return response.data
}

export const createColumn = async(databaseId:string, tableName:string, columns:Omit<Field, "id" | "createdAt" | "tableId">[]) =>{
  const response = await schema.post<Field>("/" + databaseId  + "/" + tableName, {columns});
  return response.data
}


export const deleteColumnById = async(databaseId:string, tableName:string, columnId:string) =>{
  const response = await schema.delete<Field>("/" + databaseId  + "/" + tableName + "/" + columnId);
  return response.data
}


// RelationTable 

export const findRelationAll =async (databaseId:string, ) =>{
  const response = await schema.get<Relation[]>("/" + databaseId  + "/relation")
  return response.data
}


export interface CreateRelation {
  tableId:string
  columnId:string
  targetTableId:string
  targetColumnId:string
  type: RelationType  
}

export const createRelation =async (databaseId:string, relation:CreateRelation ) =>{
  const response = await schema.post<Relation>("/" + databaseId  + "/relation", relation)
  return response.data
}

export const findRelationById =async (databaseId:string, relationId:string ) =>{
  const response = await schema.get<Relation>("/" + databaseId  + "/relation/" + relationId)
  return response.data
}

export const deleteRelationById =async (databaseId:string, relationId:string) =>{
  const response = await schema.delete<Relation>("/" + databaseId  + "/relation/" + relationId)
  return response.data
}



// recprd data

export const findAll = async(databaseId:string ,tableName:string) =>{
  const response = await api.get<{data:any[], total:number, skip:number, limit:number}>("/" + databaseId  +"/api/" + tableName);
  return response.data;
}


export const findById = async(databaseId:string, tableName:string, recordId:string) =>{
  const response = await api.get("/" + databaseId + "/api/" + tableName + "/" + recordId);
  return response.data;
}

export const deleteById = async(databaseId:string, tableName:string, recordId:string) =>{
  const response = await api.delete("/" + databaseId + "/api/" + tableName + "/" + recordId)
  return response.data
}

export const updateByById = async(databaseId:string, tableName:string, recordId:string, body:any) =>{
  const response = await api.patch("/" + databaseId + "/api/" + tableName + "/" + recordId, body)
  return response.data
}




// export const findRecord






// // datatabse schema
// export const fetchDatabases = async () => {
//   const response = await api.get<Database[]>("/databases");
//   return response.data;
// };

// export const fetchDatabasesById = async (id: string) => {
//   const response = await api.get<Database>("/databases/" + id);
//   return response.data;
// };

// export const migrateDatabase = async (id: string) => {
//   const response = await api.get<Database>("/databases/" + id + "/migrate");
//   return response.data;
// };



// export const fetchTables = async (id: string) => {
//   const response = await api.get<Table[]>(`/databases/${id}/tables`);
//   return response.data; // Kembalikan data dari respons
// };


// export const createTable1 = async (databaseId:string,tableName:string) =>{
//   const respons = await api.post<Table>(`/databases/${databaseId}/table`)
//   return respons.data
// }

// export const fetchColumnByTableName = async (db: string, tableName: string) => {
//   const response = await api.get<Field[]>(
//     `/databases/${db}/tables/${tableName}/column`
//   );
//   return response.data; // Kembalikan data dari respons
// };

// export const fetchDataByTableName = async (db: string, tableName: string) => {
//   const response = await api.get<any[]>(
//     `/databases/${db}/tables/${tableName}`
//   );
//   return response.data; // Kembalikan data dari respons
// };

// export const updatePayment = async (id: string, data: any) => {
//   const response = await api.put(`/payments/${id}`, data);
//   return response.data;
//   };
