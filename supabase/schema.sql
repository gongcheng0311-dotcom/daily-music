-- ============================================
-- 音乐推荐网站数据库 Schema
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles 表（用户资料）
-- ============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles 公开可读"
    ON profiles FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "用户只能更新自己的 profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================
-- 2. Songs 表（歌曲）
-- ============================================
CREATE TABLE songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    description TEXT,
    lyrics TEXT,
    qq_music_url TEXT,
    qq_music_id TEXT, -- 用于嵌入播放器
    bilibili_bvid TEXT, -- B站 BV号
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Songs 触发器
CREATE TRIGGER update_songs_updated_at
    BEFORE UPDATE ON songs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Songs RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Songs 公开可读"
    ON songs FOR SELECT
    TO PUBLIC
    USING (true);

-- 注意：将 'YOUR_ADMIN_UID_HERE' 替换为实际的 admin 用户 UID
CREATE POLICY "仅 admin 可写入 songs"
    ON songs FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = TRUE
    ));

-- ============================================
-- 3. Ratings 表（评分）
-- ============================================
CREATE TABLE ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(song_id, user_id)
);

-- Ratings 触发器
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ratings RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings 公开可读"
    ON ratings FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "登录用户可插入自己的评分"
    ON ratings FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可更新自己的评分"
    ON ratings FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可删除自己的评分"
    ON ratings FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- 4. Comments 表（评论）
-- ============================================
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments 触发器
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments 公开可读"
    ON comments FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "登录用户可插入评论"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可删除自己的评论"
    ON comments FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- 5. 辅助函数和视图
-- ============================================

-- 获取歌曲平均分和评分人数的视图
CREATE VIEW song_ratings_summary AS
SELECT
    song_id,
    ROUND(AVG(score)::numeric, 2) as average_score,
    COUNT(*) as rating_count
FROM ratings
GROUP BY song_id;

-- 设置 admin 用户的函数（在 SQL Editor 中执行）
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_UID';
