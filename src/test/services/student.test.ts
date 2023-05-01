import chai from 'chai';
import sinon from 'sinon';
import { ObjectId } from 'mongodb';
import mongoSetup from '../mongoSetup';
import Student from 'src/model/student';
import Group from 'src/model/group';
import { StudentSaveDto } from 'src/dto/student/studentSaveDto';
import * as studentService from 'src/services/student';

// @ts-ignore
const { assert, expect } = chai;
// @ts-ignore
const should = chai.should();

const sandbox = sinon.createSandbox();

const group1 = new Group({
  _id: new ObjectId(),
  name: "Group 1",
  startYear: 1,
});

const student1 = new Student({
  _id: new ObjectId().toString(),
  name: "John",
  surname: "Doe",
  groupId: group1._id.toString(),
  birthDate: new Date('1999-06-06'),
  phoneNumbers: ['+380667890011'],
  address: {
    country: 'UA',
    town: 'New York',
    addressString: 'Some address string',
  },
});

describe('Application Service', () => {
  before(async () => {
    /**
		 * The mongoSetup promise is resolved when the database is ready to be used.
		 * After it is resolved we can save all the needed data.
		 */
    await mongoSetup;

    await group1.save();
    await student1.save();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('createStudent should create a new student and return its id', (done) => {
    const studentDto: StudentSaveDto = {
      name: 'John',
      surname: 'Doe',
      birthDate: new Date('2000-01-01'),
      groupId: group1._id.toString(),
    };
    studentService.createStudent(studentDto)
      .then(async (id) => {
        const student = await Student.findById(id);

        expect(student).to.exist;
        expect(student?.name).to.equal(studentDto.name);
        expect(student?.surname).to.equal(studentDto.surname);
        expect(student?.birthDate).to.eql(studentDto.birthDate);
        expect(student?.groupId).to.eql(studentDto.groupId);

        done();
      })
      .catch(error => done(error));
  });

  it('getStudent should return null if student not found', (done) => {
    const nonExistentId = new ObjectId().toString();
    studentService.getStudent(nonExistentId)
      .then((student) => {
        expect(student).to.be.null;
        done();
      })
      .catch(error => done(error));
  });

  it('getStudent should return student details if found', (done) => {
    studentService.getStudent(student1._id)
      .then((studentDetails) => {
        expect(studentDetails).to.have.property('_id').that.eql(student1._id);
        expect(studentDetails).to.have.property('name', student1.name);
        expect(studentDetails).to.have.property('surname', student1.surname);
        expect(studentDetails).to.have.property('groupId', student1.groupId);
        expect(studentDetails).to.have.property('birthDate').that.eql(student1.birthDate);
        done();
      })
      .catch(error => done(error));
  });

  it('updateStudent should update a student', (done) => {
    const validateStudentStub = sandbox.stub(studentService, 'validateStudent');
    const findOneAndUpdateStub = sandbox.stub(Student, 'findOneAndUpdate');
    studentService.updateStudent(student1._id, student1)
      .then(() => {
        sandbox.assert.calledOnce(validateStudentStub);
        sandbox.assert.calledOnce(findOneAndUpdateStub);
        validateStudentStub.calledWith(student1);
        findOneAndUpdateStub.calledWith(
          { _id: student1._id },
          student1
        );
        done();
      })
      .catch(error => done(error));
  });
});