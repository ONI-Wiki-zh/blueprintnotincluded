import { Vector2 } from "../vector2";
import { BAnimationParent } from "./b-animation-parent";
import { BSourceUv } from "./b-source-uv";
import { BSpriteModifier } from "./b-sprite-modifier";
import { UtilityConnection } from '../utility-connection';
import { OverlayType } from '../overlay-type';

export class BBuilding
{
  name: string;
  prefabId: string;;
  isTilePiece: boolean;
  isSolidTile: boolean;
  isKAnimTile: boolean;
  isUtility: boolean;
  sizeInCells: Vector2;
  sceneLayer: OverlayType;

  kanimPrefix: string;
  textureName: string;

  spriteInfos: BSourceUv[];
  spriteModifiers : BSpriteModifier[];
  utilities: UtilityConnection[];
}