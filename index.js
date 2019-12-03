const sqlite = require('sqlite');
class Db
{
    /**
     * 
     * @param {string} dbpath - Path to core .sqlite database.
     */
    constructor(dbpath)
    {
        this.dbpath = dbpath;
    }

   /**
    * Get data from table / key combo
    * @param {string} table - Name of table.
    * @param {string} key - Name of key for the data.
    * @returns if data found: the parsed JSON data, if not found: boolean false
    */
    getFrom(table, key) {
        return new Promise((resolve, reject) => {
            sqlite.open(this.dbpath)
                .then(sql => {
                    sql.get(`SELECT data FROM ${table.replace(/\W/g, '')} WHERE key = ?`, key)
                        .then(data => {
                            if (data)
                                data.data ? resolve(JSON.parse(data.data)) : resolve(false);
                            else
                                resolve(false);
                        })
                        .catch(err => {
                            if ((err + "").startsWith("Error: SQLITE_ERROR: no such table:")) {
                                resolve(false);
                            } else {
                                console.log(err);
                                reject(err);
                            }
    
    
                        });
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }
    
    //TO-DO
    _getAllKeys(table){
    //return all keys in table
    return "THIS METHOD IS NOT WRITTEN YET";
    }
    
   /**
    * 
    * @param {string} table - Table name.
    * @param {string} key - A key for this data.
    * @param {Object} data - JS object data to be stored. Must be an object, not JSON string.
    */
    setTo(table, key, data) {
        return new Promise((resolve, reject) => {
            sqlite.open(this.dbpath)
                .then(sql => {
                    sql.run(`CREATE TABLE IF NOT EXISTS ${table.replace(/\W/g, '')} (key TEXT PRIMARY KEY, data TEXT)`)
                        //insert or update
                        .then(() => {
                            sql.run(`INSERT INTO ${table.replace(/\W/g, '')} (key, data)
                    VALUES(?, ?) 
                    ON CONFLICT(key) 
                    DO UPDATE SET data=excluded.data;`, key, JSON.stringify(data))
                                .then(() => {
                                    resolve();
                                })
                                .catch(err => reject(err));
    
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
module.exports = Db;