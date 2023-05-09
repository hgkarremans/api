// Onze lokale 'in memory database'. Later gaan we deze naar een
// aparte module (= apart bestand) verplaatsen.
let database = {
  users: [
    {
        id: 0,
        firstName: 'Hendrik',
        lastName: "van Dam",
        emailAddress: 'hvd@server.nl'
    },
    {
        id: 1,
        firstName: 'Marieke',
        lastName: 'Jansen',
        emailAddress: 'm@server.nl'
    }
],

  // Ieder nieuw item in db krijgt 'autoincrement' index.
  // Je moet die wel zelf toevoegen!
  index: 2
};

module.exports = database;
// module.exports = database.index;
