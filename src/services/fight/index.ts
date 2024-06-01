import Fight, { IFight } from '../../model/fight';
import axios from 'axios';

const HERO_SERVICE_URL = 'http://host.docker.internal:8080/api/hero';

export const validateHero = async (heroId: number) => {
  try {
    const response = await axios.get(`${HERO_SERVICE_URL}/${heroId}`);
    console.log(`Hero validation response for ID ${heroId}:`, response.data);
    return response.status === 200 && response.data;
  } catch (error) {
    console.error(`Error validating hero with ID ${heroId}:`, error);
    return false;
  }
};

export const createFight = async (fightData: Partial<IFight>) => {
  const heroId = Number(fightData.heroId);
  if (isNaN(heroId)) {
    throw new Error('Invalid Hero ID');
  }

  const isValidHero = await validateHero(heroId);
  if (!isValidHero) {
    throw new Error('Invalid Hero ID');
  }

  const fight = new Fight({ ...fightData, heroId });
  await fight.save();
  return fight._id;
};

export const getFightsByHeroId = async (heroId: number, size: number, from: number) => {
  if (isNaN(heroId) || isNaN(size) || isNaN(from)) {
    throw new Error('Invalid input parameters');
  }
  return Fight.find({ heroId })
    .sort({ date: -1 })
    .skip(from)
    .limit(size);
};
export const countFightsByHeroIds = async (heroIds: number[]) => {
  console.log(`Counting fights for hero IDs: ${heroIds}`);
  const counts = await Fight.aggregate([
    { $match: { heroId: { $in: heroIds } } },
    { $group: { _id: '$heroId', count: { $sum: 1 } } },
  ]);
  return counts.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
};