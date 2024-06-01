import bodyParser from 'body-parser';
import express from 'express';
import sinon from 'sinon';
import chai from 'chai';
import chaiHttp from 'chai-http';
import axios from 'axios';
import fightRouter from '../../routers/fights';
import Fight from '../../model/fight';
import { ObjectId } from 'mongodb';

const { expect } = chai;

chai.use(chaiHttp);
chai.should();

const sandbox = sinon.createSandbox();

const app = express();

app.use(bodyParser.json({ limit: '1mb' }));
app.use('/fights', fightRouter);

describe('Fight controller', () => {

  beforeEach(() => {
    sandbox.stub(axios, 'get').callsFake((url) => {
      if (url.includes('/api/hero/')) {
        return Promise.resolve({ status: 200, data: { id: 1 } });
      }
      return Promise.reject(new Error('Not Found'));
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create a new fight', (done) => {
    const fightIdAfterSave = new ObjectId();
    const fight = {
      name: "Battle of Gotham",
      date: "2024-07-01T12:00:00.000Z",
      heroId: 1,
      oppHeroteamId: 2,
    };

    const saveOneStub = sandbox.stub(
      Fight.prototype,
      'save',
    );
    saveOneStub.resolves({
      ...fight,
      _id: fightIdAfterSave,
    });

    chai.request(app)
      .post('/fights')
      .send({ ...fight })
      .end((_, res) => {
        res.should.have.status(201);
        expect(res.body.id).to.match(/^[0-9a-fA-F]{24}$/);

        done();
      });
  });

  it('should return a list of fights for a given hero ID', (done) => {
    const fights = [
      {
        _id: new ObjectId().toString(),
        name: "Battle of Metropolis",
        date: "2024-06-01T12:00:00.000Z",
        heroId: 1,
        oppHeroteamId: 1,
      },
      {
        _id: new ObjectId().toString(),
        name: "Battle of Metropolis",
        date: "2024-06-01T12:00:00.000Z",
        heroId: 1,
        oppHeroteamId: 1,
      },
    ];

    const findStub = sandbox.stub(
      Fight,
      'find',
    );
    findStub.returns({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.resolve(fights),
        }),
      }),
    } as any); // Cast to any to avoid TypeScript issues

    chai.request(app)
      .get('/fights')
      .query({ heroId: 1, size: 5, from: 0 })
      .end((_, res) => {
        res.should.have.status(200);
        expect(res.body).to.deep.equal(fights);

        done();
      });
  });

  it('should count fights by hero IDs', (done) => {
    const counts = [
      { _id: 1, count: 5 },
      { _id: 2, count: 3 },
      { _id: 3, count: 2 },
    ];

    const aggregateStub = sandbox.stub(
      Fight,
      'aggregate',
    );
    aggregateStub.resolves(counts);

    chai.request(app)
      .post('/fights/_counts')
      .send({ heroIds: [1, 2, 3] })
      .end((_, res) => {
        res.should.have.status(200);
        expect(res.body).to.deep.equal({
          1: 5,
          2: 3,
          3: 2,
        });

        done();
      });
  });
});
