-- ============================================
-- 数据库修改：允许同一用户多次评分和评论
-- ============================================

-- 1. 移除 ratings 表的 UNIQUE 约束（允许同一用户多次评分）
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_song_id_user_id_key;

-- 2. 修改 RLS 策略：允许用户插入多条记录
-- 先删除旧的策略
DROP POLICY IF EXISTS "用户可更新自己的评分" ON ratings;
DROP POLICY IF EXISTS "用户可删除自己的评分" ON ratings;
DROP POLICY IF EXISTS "用户可插入自己的评分" ON ratings;
DROP POLICY IF EXISTS "所有人可查看评分" ON ratings;

-- 创建新的策略
CREATE POLICY "所有人可查看评分"
    ON ratings FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "用户可插入自己的评分"
    ON ratings FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可删除自己的评分"
    ON ratings FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- 3. 确保 comments 表有正确的 RLS 策略
-- ============================================
DROP POLICY IF EXISTS "所有人可查看评论" ON comments;
DROP POLICY IF EXISTS "用户可插入自己的评论" ON comments;
DROP POLICY IF EXISTS "用户可删除自己的评论" ON comments;

CREATE POLICY "所有人可查看评论"
    ON comments FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "用户可插入自己的评论"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可删除自己的评论"
    ON comments FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- 如果需要重置数据（可选）
-- ============================================
-- TRUNCATE ratings CASCADE;
-- TRUNCATE comments CASCADE;
