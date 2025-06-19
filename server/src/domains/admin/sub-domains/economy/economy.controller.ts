import { Request, Response, NextFunction } from 'express';
import { economyConfig } from '@shared/economy/economy.config';
import { rainTipConfig } from '@shared/economy/rain-tip-config';
import { shopItems } from '@shared/economy/shop-items';

// TODO: in future load overrides from DB

export const getEconomyConfig = async (req: Request, res: Response) => {
  res.json({ economyConfig, rainTipConfig, shopItems });
};

export const updateEconomyConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For MVP we only allow whole-config replacement; future: diff & validate.
    // Accept partial overrides and persist to DB (not implemented).
    // Just echo back for now.
    res.json({ message: 'Endpoint stub – persistence not yet implemented.' });
  } catch (err) {
    next(err);
  }
}; 