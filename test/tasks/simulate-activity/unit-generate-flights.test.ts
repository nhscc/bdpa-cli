test.todo('this');

// describe('::generateFlights', () => {
//   it('rejects if there are no airports', async () => {
//     expect.hasAssertions();
//     process.env.FLIGHTS_GENERATE_DAYS = '1';
//     await (await getDb()).collection('airports').deleteMany({});
//     await expect(Backend.generateFlights(/*silent=*/ true)).toReject();
//   });

//   it('rejects if there are no airlines', async () => {
//     expect.hasAssertions();
//     process.env.FLIGHTS_GENERATE_DAYS = '1';
//     await (await getDb()).collection('airlines').deleteMany({});
//     await expect(Backend.generateFlights(/*silent=*/ true)).toReject();
//   });

//   it('does something if airports/airlines exist', async () => {
//     expect.hasAssertions();
//     process.env.FLIGHTS_GENERATE_DAYS = '1';
//     const flightsDb = (await getDb()).collection<WithId<InternalFlight>>('flights');
//     await flightsDb.deleteMany({});

//     const lastFlightId1 = (await flightsDb.find().sort({ _id: -1 }).limit(1).next())
//       ?._id;
//     expect(lastFlightId1).toBeUndefined();

//     await expect(Backend.generateFlights(/*silent=*/ true)).resolves.not.toBe(0);

//     const lastFlightId2 = (await flightsDb.find().sort({ _id: -1 }).limit(1).next())
//       ?._id;
//     expect(lastFlightId2).toBeDefined();
//   });
// });
