import { TestCases } from './TestCases';

let Test;

beforeAll(() => {
    Test = new TestCases();
});

test('login test', async () => {
    jest.setTimeout(30000);
    const loginResult = await Test.TestAuthLogin();
    expect(loginResult).not.toBe(false);
    expect(Test.token).toBeDefined();
    expect(Test.store).toBeDefined();
}, 30000);

test('create Employee', async () => {
    jest.setTimeout(30000);
    const createResponse = await Test.TestCreateEmployee();
    expect(createResponse).not.toBe(false);
}, 30000);

test('create customer', async () => {
    jest.setTimeout(30000);
    const createResponse = await Test.TestCreateCustomer();
    expect(createResponse).not.toBe(false);
}, 30000);

test('get service types', async () => {
    jest.setTimeout(30000);
    const typeResult = await Test.TestGetServiceType();
    expect(typeResult).not.toBe(false);
}, 30000);

test('create service', async () => {
    jest.setTimeout(30000);
    const createResponseServ = await Test.TestCreateService();
    expect(createResponseServ).not.toBe(false);
}, 30000);

test('get service groups', async () => {
    jest.setTimeout(30000);
    const serviceResult = await Test.TestGetServGrp();
    expect(serviceResult).not.toBe(false);
}, 30000);

test('get timings', async () => {
    const TimingResult = await Test.TestGetTimings();
    expect(TimingResult).not.toBe(false);
});

test('create booking', async () => {
    const BookingCreated = await Test.TestCreateBooking();
    expect(BookingCreated).not.toBe(false);
}, 30000);

test('delete booking', async () => {
    const deleteResponse = await Test.TestDeleteBooking();
    expect(deleteResponse).not.toBe(false);
}, 30000);

test('delete service', async () => {
    const deleteResponse = await Test.TestDeleteService();
    expect(deleteResponse).not.toBe(false);
}, 30000);

test('delete customer', async () => {
    const deleteResponse = await Test.TestDeleteCustomer();
    expect(deleteResponse).not.toBe(false);
}, 30000);

test('delete Employee', async () => {
    const deleteResponse = await Test.TestDeleteEmployee();
    expect(deleteResponse).not.toBe(false);
}, 30000);

afterAll(() => {
    Test.TestReset();
});
