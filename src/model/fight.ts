import mongoose, {Document,Schema} from 'mongoose';

export interface IFight extends Document {
  name: string;
  date: Date;
  heroId: number;
  oppHeroteamId: number;
}

const fightSchema = new Schema<IFight>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  heroId: { type: Number, required: true },
  oppHeroteamId: { type: Number, required: true },
});

const Fight = mongoose.model<IFight>('Fight', fightSchema);

export default Fight;
