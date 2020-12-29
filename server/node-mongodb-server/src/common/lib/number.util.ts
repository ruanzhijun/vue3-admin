import * as _ from 'lodash'

export class NumberUtil {
  static fixedFloat(numNeedFix: number, byte: number = 2): number {
    if (!numNeedFix) {
      return 0
    }
    return parseFloat(numNeedFix.toFixed(_.toInteger(byte)))
  }

  static fixedFloatPro(numberNeedFix: number): number {
    const left = Math.abs(numberNeedFix - NumberUtil.fixedFloat(numberNeedFix))
    // 是 0.34999999999 的情况才 fix
    if (left < 0.00001) {
      return NumberUtil.fixedFloat(numberNeedFix)
    }
    return numberNeedFix
  }

  static cutFloat(numberNeedCut: number, digits: number = 2): number {
    if (!numberNeedCut || digits < 0) {
      return numberNeedCut
    }
    numberNeedCut = NumberUtil.fixedFloatPro(numberNeedCut)
    const isMinus = (numberNeedCut < 0)
    if (isMinus) {
      numberNeedCut = numberNeedCut * -1
    }
    const result = NumberUtil.fixedFloatPro(_.floor(numberNeedCut, digits))
    return result * (isMinus ? -1 : 1)
  }

  static thousandBitSeparator(numberNeedSeparator: number, {digits = 2, symbol = ',', force = false} = {}) {
    if ((numberNeedSeparator && _.isNil(numberNeedSeparator)) || !numberNeedSeparator) {
      return numberNeedSeparator
    }
    numberNeedSeparator = NumberUtil.cutFloat(numberNeedSeparator, digits)
    const arr = numberNeedSeparator.toString().split('.')
    arr[0] = arr[0].replace(/(\d)(?=(?:\d{3})+$)/g, `$1${symbol}`)
    if (force && arr[1]) {
      arr[1] = Number(`0.${arr[1]}`).toFixed(2).split('.')[1]
    }
    return arr.join('.')
  }

  /**
   * 生成 [min - max] 的随机数
   * @param min 最小数
   * @param max 最大数
   */
  static rand(min, max): number {
    const range = max - min
    const rand = Math.random()
    return min + Math.round(rand * range)
  }
}
