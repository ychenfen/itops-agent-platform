import { logger } from './logger';

/**
 * 把数据库读出的宽字符串收敛到字面量联合类型。
 *
 * 背景：仓储层下沉后，服务层的领域接口用字面量联合描述状态字段，而 SQLite 侧
 * 对应的列是无约束的 TEXT。直接用 as 断言会掩盖真实风险——历史数据、外部写入
 * 或迁移中途都可能留下联合之外的值。这里改为运行时校验：命中则返回，未命中回退
 * 到调用方指定的默认值并记一条 warn，便于排查脏数据。
 *
 * @param value    数据库读出的原始值
 * @param allowed  允许的字面量集合
 * @param fallback 未命中时的回退值
 * @param context  出现脏数据时写进日志的定位信息，例如 'ScaleRule.targetType'
 */
export function narrowEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
  context: string,
): T {
  if (value != null && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  if (value != null && value !== '') {
    logger.warn(`${context}: 数据库中存在未知取值 ${JSON.stringify(value)}，已回退为 ${fallback}`);
  }
  return fallback;
}
