import { Request, Response } from 'express';
import httpStatus from 'http-status';
import log4js from 'log4js';
import { createFight, getFightsByHeroId, countFightsByHeroIds } from '../../services/fight';
import { InternalError } from '../../system/internalError';

const logger = log4js.getLogger();

export const saveFight = async (req: Request, res: Response) => {
  try {
    const id = await createFight(req.body);
    res.status(httpStatus.CREATED).send({ id });
  } catch (err) {
    const { message, status } = new InternalError(err as Error);
    logger.error('Error in creating fight.', err);
    res.status(status).send({ message });
  }
};

export const getFightsByHeroIdController = async (req: Request, res: Response) => {
  const { heroId, size, from } = req.query;
  logger.info(`Received request - heroId: ${heroId}, size: ${size}, from: ${from}`);

  try {
    const fights = await getFightsByHeroId(Number(heroId), Number(size), Number(from));
    res.status(200).send(fights);
  } catch (error) {
    logger.error('Error in getting fights by hero ID.', error);
    res.status(400).send({ message: (error as Error).message });
  }
};

export const countFightsByHeroIdsController = async (req: Request, res: Response) => {
  const heroIds = (req.body.heroIds || []).map((id: string) => Number(id));

  logger.info(`Received request to count fights - heroIds: ${heroIds}`);

  try {
    const counts = await countFightsByHeroIds(heroIds);
    res.status(200).send(counts);
  } catch (error) {
    logger.error('Error in counting fights by hero IDs.', error);
    res.status(400).send({ message: (error as Error).message });
  }
};
