import type { Status, Condition, SleeveCondition } from '@trowel/types'
import {
  Status as StatusDB,
  Condition as ConditionDB,
  SleeveCondition as SleeveConditionDB,
} from '../generated/prisma'

export function toStatusDB(status: Status): StatusDB {
  switch (status) {
    case 'For Sale':
      return StatusDB.ForSale
    case 'Draft':
      return StatusDB.Draft
  }
}

export function toConditionDB(condition: Condition): ConditionDB {
  switch (condition) {
    case 'Mint (M)':
      return ConditionDB.Mint
    case 'Near Mint (NM or M-)':
      return ConditionDB.NearMint
    case 'Very Good Plus (VG+)':
      return ConditionDB.VeryGoodPlus
    case 'Very Good (VG)':
      return ConditionDB.VeryGood
    case 'Good Plus (G+)':
      return ConditionDB.GoodPlus
    case 'Good (G)':
      return ConditionDB.Good
    case 'Fair (F)':
      return ConditionDB.Fair
    case 'Poor (P)':
      return ConditionDB.Poor
  }
}

export function toSleeveConditionDB(
  sleeveCondition: SleeveCondition
): SleeveConditionDB {
  switch (sleeveCondition) {
    case 'Mint (M)':
      return SleeveConditionDB.Mint
    case 'Near Mint (NM or M-)':
      return SleeveConditionDB.NearMint
    case 'Very Good Plus (VG+)':
      return SleeveConditionDB.VeryGoodPlus
    case 'Very Good (VG)':
      return SleeveConditionDB.VeryGood
    case 'Good Plus (G+)':
      return SleeveConditionDB.GoodPlus
    case 'Good (G)':
      return SleeveConditionDB.Good
    case 'Fair (F)':
      return SleeveConditionDB.Fair
    case 'Poor (P)':
      return SleeveConditionDB.Poor
    case 'Generic':
      return SleeveConditionDB.Generic
    case 'Not Graded':
      return SleeveConditionDB.NotGraded
    case 'No Cover':
      return SleeveConditionDB.NoCover
  }
}
