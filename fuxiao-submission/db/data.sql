-- ============================================================================
--  拂晓的投稿系统 · 演示数据（由 tools/seed.mjs 从博客内容生成）
--  注意：本脚本会清空内容表后重新写入，仅用于首次初始化 / 重置演示数据。
-- ============================================================================
USE fuxiao_admin;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE article;
TRUNCATE TABLE album;
TRUNCATE TABLE moment;
TRUNCATE TABLE project;
TRUNCATE TABLE upcoming_project;
TRUNCATE TABLE photo;
TRUNCATE TABLE friend;
TRUNCATE TABLE archive_entry;
TRUNCATE TABLE about_profile;
TRUNCATE TABLE site_setting;
TRUNCATE TABLE now_item;
TRUNCATE TABLE submission;
TRUNCATE TABLE media_asset;

-- 分类
INSERT INTO category (id, name, slug, status_key, sort_order, visible, created_at) VALUES (1, '技术随笔', 'tech', 'tech', 1, 1, NOW());
INSERT INTO category (id, name, slug, status_key, sort_order, visible, created_at) VALUES (2, '读书', 'read', 'read', 2, 1, NOW());
INSERT INTO category (id, name, slug, status_key, sort_order, visible, created_at) VALUES (3, '生活', 'life', 'life', 3, 1, NOW());
INSERT INTO category (id, name, slug, status_key, sort_order, visible, created_at) VALUES (4, '摄影随笔', 'photo', 'photo', 4, 1, NOW());
INSERT INTO category (id, name, slug, status_key, sort_order, visible, created_at) VALUES (5, '写字', 'write', 'write', 5, 1, NOW());

-- 文章
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (1, 'p0', '把博客当成一间屋子来设计', '/media/anime-desk.jpg', '深夜，一个女孩在雨窗前伏案写字，台灯照着她的侧脸', '我给自己定下的第一件事，不是选框架，而是决定这间屋子朝哪边开窗。', '我给自己定下的第一件事，不是选框架，而是决定这间屋子朝哪边开窗，光从哪里进来。', 1, 'tech', '2026-10-28', '拂晓', '杭州', 1, 'published', 1860, 1174, 3, '["技术随笔","长期有效","杭州"]', '[{"t":"p","text":"我搭过四个博客。前三个都死在同一件事上：我把它们当成产品来做，而不是当成房间来住。"},{"t":"p","text":"产品要增长、要指标、要有「信息架构」。房间不需要。房间只需要三件事：光从哪里进来，人坐在哪里，以及门是不是好推。第四个站活到了现在，第七年，四十七篇文章，没有一次重构。这篇文章记的是我当时做的几个决定，以及它们后来各自长成了什么样。"},{"t":"h2","text":"先决定屋子朝哪边开窗"},{"t":"p","text":"我花了整整一个晚上，在白纸上写「这个站要做什么」。写满一页之后，我把所有的动词圈出来，发现只有两个：写和读。没有「转化」，没有「留存」，也没有「展示作品集」。"},{"t":"p","text":"这件事定下来之后，很多设计问题自己消失了。既然只有写和读，那么首页不需要入口矩阵，导航不需要八项并列，文章页不需要侧边栏推荐位。一条路径就够：从首页到一篇文章，从一篇文章到另一篇。"},{"t":"q","text":"一条路走顺，比八条路都通，更像一个可以住下来的地方。"},{"t":"p","text":"后来我加过摄影、说说、项目三个板块，它们都不是「新功能」，而是同一间屋子里不同的房间：一扇朝街的窗，一面挂照片的墙，一张堆着半成品的工作台。它们共享同一条走廊，你从任何一间出来，都能回到走廊上。"},{"t":"h2","text":"把墙刷成什么颜色"},{"t":"p","text":"墙的颜色定了三个月。最后的方案是一片偏冷的灰纸，近黑的墨字，和一个只出现在该出现的地方的暖色，像深夜里唯一亮着的那盏灯。"},{"t":"p","text":"写字的人大概都有一点私心：希望自己的页面在别人的收藏夹里，是一眼能认出来的那一格。所以我给它定的规矩是「纸」：所有的字都排在纸上，插图是彩色的，像文库本里偶尔夹着的口绘。"},{"t":"p","text":"而摄影那一册是另一本书：黑底、满版、只有照片说话。两本书共用一条走廊，但推门进去是两个屋子。"},{"t":"img","src":"anime-store.jpg","alt":"雨夜便利店门口，暖光洒在湿漉漉的地面上","cap":"凌晨一点，楼下便利店的灯还亮着。有几篇文章的最后一段是在那儿写的。"},{"t":"h2","text":"留一个不需要解释的角落"},{"t":"p","text":"第三个决定是最不理性的：我在首页留了一块空。它不承载任何信息，只在滚动到某一段时，让画面安静一下。有人问过我这块空的用处，我答不上来。"},{"t":"p","text":"但我后来想明白，房间里的空地和房间里的家具一样重要。你走进朋友家，最先放松下来的地方，往往不是客厅正中那片摆得最满的沙发区，而是靠窗那截空着的窗台。"},{"t":"code","text":"/* 这间屋子的墙和灯 */\\n:root {\\n  --bg:   #e9e8e4;   /* 墙：偏冷的灰纸 */\\n  --ink:  #14161a;   /* 字：近黑，不纯黑 */\\n  --lamp: #8a5a1f;   /* 灯：只给当前页和一个动作 */\\n}\\n\\n/* 纸上的一切都可以是彩色的，\\n   只有摄影那一册是黑底 */\\n.photo-book { background: #0a0a0b; }"},{"t":"p","text":"这几行是所有决定的落点。没有设计系统，没有组件库，只有一个调色板和两套字：一套宋体负责所有需要被读的句子，一套无衬线负责日期、编号、以及那些只需要被扫到的字。"},{"t":"img","src":"anime-book.jpg","alt":"台灯下翻开的书页，暖光里浮着细尘","cap":"写到一半停下来翻两页书：这个站最开始就是为了放这些零碎的想法。"},{"t":"img","src":"anime-train.jpg","alt":"深夜的末班电车里，一个女孩靠在窗边","cap":"末班车上想通的事情，回家以后往往就写不出来了，所以我随身带本子。"},{"t":"h2","text":"维护一间屋子"},{"t":"p","text":"住到第三年，我发现维护一个站和维护一间屋子是同一件事："},{"t":"p","text":"这套办法没有任何技术含量，但它让这个站活过了七年，比我的三台笔记本都久。写到这里是凌晨一点，屋子里只剩显示器的光和窗外的路灯。如果你也在搭自己的站，希望它先是一间屋子，然后才是一个网站。"}]', '2026-10-28 23:40:00', '2026-10-28 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (2, 'p1', 'Node 里的流：一个缓慢的理解过程', '/media/anime-train.jpg', '深夜的末班电车里，一个女孩靠在窗边', '我花了三年才在管道、背压和缓冲区之间，摸到一个能说出口的比喻。', '我花了三年才在管道、背压和缓冲区之间，摸到一个能说出口的比喻。', 1, 'tech', '2026-10-12', '拂晓', '杭州', 1, 'published', 1780, 589, 2, '["技术随笔","长期有效","杭州"]', '[{"t":"p","text":"我第一次真正理解流，不是在文档里，是在一次四百兆的日志导出里。那时候我把整个文件 readFile 进来，再一次性写出去，进程在第 1.2 秒就 OOM 了。"},{"t":"p","text":"后来我把同一段逻辑改成 createReadStream，内存曲线从一座山变成一条平线。那次之后我才明白，流不是 API，是一种对待数据的态度：不要一次拿完。"},{"t":"h2","text":"管道是一条水渠"},{"t":"p","text":"你可以把流想成一条水渠。上游快、下游慢的时候，水会在中间积起来；积到某个高度，就得让上游停一停。这件事在代码里叫背压，在生活里叫「别写得太快」。"},{"t":"p","text":"Node 的 pipe 会自动处理这件事，但它只在两边都是流的时候才成立。一旦中间夹了一个 async 的转换函数，水渠就断了，你得自己接管。"},{"t":"q","text":"背压不是流的缺点，是它唯一的诚实之处。"},{"t":"code","text":"import { createReadStream, createWriteStream } from ''node:fs'';\\nimport { pipeline } from ''node:stream/promises'';\\nimport { createGzip } from ''node:zlib'';\\n\\nawait pipeline(\\n  createReadStream(''access.log''),\\n  createGzip(),\\n  createWriteStream(''access.log.gz'')\\n);"},{"t":"p","text":"这段代码我用了三年，没有改过一个字。好的抽象大概就是这样：你在它上面写的东西，几年后看还是对的。"}]', '2026-10-12 23:40:00', '2026-10-12 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (3, 'p2', '《夜晚的潜水艇》与不可抵达的地方', '/media/anime-book.jpg', '台灯下翻开的书页，暖光里浮着细尘', '陈春成写的不是幻想，是我们把童年沉进海底之后的那点回声。', '陈春成写的不是幻想，是我们把童年沉进海底之后的那点回声。', 2, 'read', '2026-09-14', '拂晓', '杭州', 1, 'published', 1700, 264, 2, '["读书","长期有效","杭州"]', '[{"t":"p","text":"《夜晚的潜水艇》里所有的主人公都在做同一件事：给一个无法抵达的地方造一艘船。有的人用想象力造，有的人用一生的时间造，有的人只是把房间漆成海的颜色。"},{"t":"p","text":"我读第一遍的时候以为这是本关于幻想的书，读第二遍才发现它写的是告别。每一次下潜，都是一次不肯上岸。"},{"t":"h2","text":"不可抵达不是失败"},{"t":"p","text":"书里最好的一篇是《竹峰寺》，一个人为了藏一块碑，把整座山走了一遍。那块碑最后藏在哪里，作者没有说死，但你知道它一定在。"},{"t":"p","text":"我们这代人对「留下点什么」有种执念。写博客、拍照、备份硬盘，本质上都是在藏一块碑：不需要有人找到，只需要它还在。"},{"t":"q","text":"有些地方你要一直不去，它才一直在那儿。"}]', '2026-09-14 23:40:00', '2026-09-14 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (4, 'p3', '深夜的部署脚本与它的十六个坑', '/media/anime-screen.jpg', '暗房间里，屏幕的冷光照在一个人的侧脸上', '脚本跑了八十遍之后，我把每一条报错都抄进了笔记本，这里是那份清单。', '脚本跑了八十遍之后，我把每一条报错都抄进了笔记本，这里是那份清单。', 1, 'tech', '2026-09-26', '拂晓', '杭州', 0, 'published', 1620, 325, 2, '["技术随笔","长期有效","杭州"]', '[{"t":"p","text":"我的部署脚本第一版只有四行：拉代码、装依赖、构建、重启。它在我自己的机器上跑了半年没出过问题。"},{"t":"p","text":"换到一台干净的服务器上，第一晚就失败了三次：node 版本不对、构建时没有内存、重启后端口没释放。第四次我把 tar 打错了包，线上页面白了两分钟。"},{"t":"h2","text":"坑的分布"},{"t":"p","text":"后来我复盘，十六个坑里有十一个是环境问题，三个是路径问题，只有两个是代码问题。也就是说，绝大多数事故跟我的程序无关，跟我对那台机器的假设有关。"},{"t":"p","text":"现在的脚本开头会先打印一段自检：node -v、磁盘余量、当前分支、上一次部署的时间。这四行让我少熬了很多夜。"},{"t":"q","text":"脚本不会骗你，环境会。"},{"t":"code","text":"set -euo pipefail\\nnode -v\\ndf -h / | tail -1\\ngit rev-parse --short HEAD\\n# 失败就停，别假装成功"}]', '2026-09-26 23:40:00', '2026-09-26 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (5, 'p4', '用 Rust 重写一个静态站点生成器', '/media/cover-rust.jpg', '黑色天空下的白色折角建筑', '为了一千篇文章的构建时间，我用一个周末学会了所有权，也用掉了三个周末。', '为了一千篇文章的构建时间，我用一个周末学会了所有权，也用掉了三包烟。', 1, 'tech', '2026-08-30', '拂晓', '杭州', 0, 'published', 1392, 280, 2, '["技术随笔","长期有效","杭州"]', '[{"t":"p","text":"旧生成器是 Node 写的，一千篇文章要跑四十七秒。我想试试 Rust，理由很不充分：我想知道那些被反复提到的概念到底在解决什么。"},{"t":"p","text":"第一个小时我什么都没写出来，全在读编译器的报错。第三个小时我学会了给字符串加 to_owned()，第六个小时我开始理解为什么不该到处 to_owned()。"},{"t":"h2","text":"借用检查器教我的事"},{"t":"p","text":"它并不聪明，它只是不肯放过含糊的地方。一段在 JS 里「看起来没问题」的代码，在 Rust 里必须说清楚谁拥有这块内存、它活多久。"},{"t":"p","text":"重写完之后构建时间是 3.1 秒。但真正留下来的不是这 44 秒，是我现在写别的语言时，会先想清楚数据的归属。"},{"t":"q","text":"编译器不是在阻止你，是在让你把话说清楚。"}]', '2026-08-30 23:40:00', '2026-08-30 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (6, 'p5', '胶片给我的三个技术隐喻', '/media/anime-darkroom.jpg', '暗房的红灯下，两只手从显影盘里夹起一张刚显影的照片', '宽容度、互易律失效、以及为什么有些问题只能靠近才看得见。', '宽容度、互易律失效，以及为什么有些问题只能靠近才看得见。', 4, 'photo', '2026-08-11', '拂晓', '杭州', 0, 'published', 1312, 248, 2, '["摄影随笔","长期有效","杭州"]', '[{"t":"p","text":"胶片有三个特性，我后来在写代码时反复想起。"},{"t":"h2","text":"宽容度"},{"t":"p","text":"负片能同时记住很亮和很暗的地方，扫描的时候再决定要哪一段。数字文件看起来也能拉回高光，但那是因为它一开始就截断了。真正的宽容度是「还有东西可救」，不是「看起来没死」。"},{"t":"h2","text":"互易律失效"},{"t":"p","text":"曝光时间太长的时候，光圈和快门不再等价，你得补偿。系统在极端条件下会偏离它的规则，这件事在任何工程里都成立。"},{"t":"h2","text":"靠近才看得见"},{"t":"p","text":"同一面墙，退后三步是一块灰，凑近十厘米是颗粒、划痕和一层旧的漆。很多 bug 也是这样，隔着一个抽象层看永远是对的。"},{"t":"q","text":"器材决定你拍不到什么，不决定你拍到什么。"}]', '2026-08-11 23:40:00', '2026-08-11 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (7, 'p6', '在终端里读完一本书', '/media/cover-terminal.jpg', '石拱回廊里斜进来的暖光', '把一本小说拆成纯文本，用最笨的办法读完，反而记住了更多。', '把一本小说拆成纯文本，用最笨的办法读完，反而记住了更多。', 3, 'life', '2026-07-29', '拂晓', '杭州', 0, 'published', 1232, 229, 2, '["生活","长期有效","杭州"]', '[{"t":"p","text":"有一阵子我在终端里读书。把 epub 转成 txt，用 less 翻开，一次只看一屏，翻页靠空格。"},{"t":"p","text":"这个办法很笨，笨到没有任何可以分心的东西：没有推荐、没有高亮、没有别人划的线。读到第三本的时候我发现，我居然能记住章节的顺序。"},{"t":"h2","text":"一次只出现一屏"},{"t":"p","text":"屏幕的限制变成了阅读的节奏。小说本来就该一屏一屏地读，像翻纸页那样，而不是在一个无限长的滚动条里被算法推着走。"},{"t":"p","text":"后来我把这个站的文章页也按这个思路改了：一次只给你一段，段落之间留白，别的地方什么都不放。"},{"t":"q","text":"没有进度条的阅读，反而读得完。"}]', '2026-07-29 23:40:00', '2026-07-29 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (8, 'p7', '冬夜的路灯与它的色温', '/media/anime-store.jpg', '雨夜便利店门口，暖光洒在湿漉漉的地面上', '同样是暖光，两千七百开尔文和三千三百开尔文，是两种不同的想家方式。', '同样是暖光，两千七百开尔文和三千三百开尔文，是两种不同的想家。', 4, 'photo', '2026-07-06', '拂晓', '杭州', 0, 'published', 1152, 217, 2, '["摄影随笔","长期有效","杭州"]', '[{"t":"p","text":"冬夜的路灯大多是高压钠灯，色温在两千出头，橙得发红。老式白炽灯是两千七，便利店门口的 LED 是四千，越新越白。"},{"t":"p","text":"我拍过一整条街的灯。回来对着照片看，两千七的那种光会让皮肤显得暖，四千的那种会让皮肤显得干净——干净和暖，很难同时要。"},{"t":"h2","text":"把色温当成叙事"},{"t":"p","text":"后来我修图时会先问自己：这张照片应该让人想起家，还是想起加班？前者往两千八走，后者往四千五走。"},{"t":"p","text":"这大概是摄影里最便宜也最有效的情绪工具：不用换镜头，不用等天气，改一个数字就行。"},{"t":"q","text":"色温是记忆的温度计。"}]', '2026-07-06 23:40:00', '2026-07-06 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (9, 'p8', '写给还没开始写博客的人', '/media/ph-rain.jpg', '雨滴挂在窗上，后面是模糊的车灯', '不需要选题库，不需要排版工具，先写三段，然后把它放上去。', '不需要选题库，不需要排版工具，先写三段，然后把它放上去。', 3, 'life', '2026-06-18', '拂晓', '杭州', 0, 'published', 924, 251, 2, '["生活","长期有效","杭州"]', '[{"t":"p","text":"每年都有人问我怎么开始写博客。我的答案一直很扫兴：先写三段，然后放到网上去，别管域名好不好看。"},{"t":"p","text":"你会卡住的地方不是工具，是「这篇够不够好」。这个问题没有答案，因为它的前提是错的：第一篇的作用不是好，是存在。"},{"t":"h2","text":"三个能立刻用上的办法"},{"t":"p","text":"一，写完就发，改到第三遍就停手。二，标题写具体的事，别写「关于 xx 的思考」。三，留一个只有你自己知道的固定结尾，让文章有个句号。"},{"t":"p","text":"这三条我用了七年，现在还在用。写博客这件事，能坚持下来的从来不是有才华的人，是愿意让文章不完美地存在的人。"},{"t":"q","text":"第一篇文章的唯一任务，是让第二篇有可能发生。"}]', '2026-06-18 23:40:00', '2026-06-18 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (10, 'p9', '把构建时间从 92 秒压到 11 秒', '/media/ph-spiral.jpg', '混凝土螺旋，黑白', '缓存、并行、以及一处我错了两年的图片处理顺序。', '缓存、并行，以及一处我错了两年的图片处理顺序。', 1, 'tech', '2026-05-22', '拂晓', '杭州', 0, 'published', 844, 313, 2, '["技术随笔","长期有效","杭州"]', '[{"t":"p","text":"九十二秒里，有六十一秒花在图片上。我一开始以为是压缩算法太慢，换了三个库，最好的成绩是五十八秒。"},{"t":"p","text":"真正的问题在顺序：我在压缩之后才裁切，等于把所有像素都压了一遍，再扔掉一半。把裁切提到前面，那一项从六十一秒变成九秒。"},{"t":"h2","text":"三个改动"},{"t":"p","text":"先裁切再压缩；把串行的图片处理改成按 CPU 核数跑 worker；给没变的文件加内容哈希缓存。三个改动加起来，九十二秒变成十一秒。"},{"t":"p","text":"第一件事是顺序，第二件事是并行，第三件事是不做。最后一个往往最有效，也最容易被忘掉。"},{"t":"q","text":"性能问题一半是顺序问题。"},{"t":"code","text":"# 之前：先压后裁\\nresize(compress(src), 1600)\\n\\n# 之后：先裁后压，并缓存\\nresize(src, 1600) |> compress |> cache(hash)"}]', '2026-05-22 23:40:00', '2026-05-22 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (11, 'p10', '一次搬家：从云主机到自己家的旧笔记本', '/media/ph-lightwell.jpg', '天井直上，尽头是一块亮', '每月四十七块的机器换成了抽屉里的旧笔记本，过程和代价都写在这里。', '每月四十七块的机器换成了抽屉里的旧笔记本，过程和代价都写在这里。', 1, 'tech', '2026-04-09', '拂晓', '杭州', 0, 'published', 764, 250, 2, '["技术随笔","长期有效","杭州"]', '[{"t":"p","text":"搬家这件事我想了两年。真正让我下决心的是账单：一台 1 核 2G 的云主机，一年五百多，而我这个站一天的访问量不到两百。"},{"t":"p","text":"现在它跑在一台 2016 年的笔记本上，插着网线，放在书架第二层。风扇声音很小，夜里能听见。"},{"t":"h2","text":"代价是什么"},{"t":"p","text":"电费每月大概六块，宽带本来就有。真正的代价是：机器会重启、会断电、会因为我拉错一根线而消失。所以我给它配了一个每小时的增量备份，和一个放在父母家的树莓派。"},{"t":"p","text":"这不是省钱，是把「麻烦」换成「掌控」。我愿意接这个麻烦，因为我终于知道自己的一千篇文章放在哪块硬盘上。"},{"t":"q","text":"自托管不是省钱，是把麻烦换成掌控。"}]', '2026-04-09 23:40:00', '2026-04-09 23:40:00');
INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (12, 'p11', '读《我与地坛》：与遗憾慢慢和解', '/media/ph-mist.jpg', '雾中静水，天边一层浅色的光', '地坛很大，大到可以放下一个人所有说不出口的部分。', '地坛很大，大到可以放下一个人所有说不出口的部分。', 2, 'read', '2026-03-15', '拂晓', '杭州', 0, 'published', 684, 219, 2, '["读书","长期有效","杭州"]', '[{"t":"p","text":"重读《我与地坛》是在一个下雨的下午。上一次读是大学，那时候我记住的是「死是一件不必急于求成的事」。"},{"t":"p","text":"这次记住的是另一句：园子里的每一棵树他都认识。一个人反复走同一条路，走到能认出每一棵树，这件事本身就是一种治疗。"},{"t":"h2","text":"遗憾不会消失"},{"t":"p","text":"史铁生没有把苦难写成勋章，也没有写成控诉。他只是坐在那里，看四季过去，然后把看到的东西写下来。"},{"t":"p","text":"我后来理解，所谓和解不是把遗憾解决掉，是给它找一个可以长期住下去的房间。地坛就是那个房间。"},{"t":"q","text":"遗憾不会消失，它会长成别的东西。"}]', '2026-03-15 23:40:00', '2026-03-15 23:40:00');

-- 影集
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (1, 'neon', '霓虹下的人', '/media/pt-660.jpg', '夜里，一个女孩双手捧着一支燃着的仙女棒', 2026, '拍这一组，是因为我发现她在便利店门口等我的时候最好看：手上还提着伞，肩膀是塌下来的，整个人没有在为一件事做准备。', '["2026 · 十八张","模特 阿岚","杭州 · 中山北路"]', '[{"k":"年份","v":"2026 年 4 月至 6 月"},{"k":"地点","v":"杭州 · 中山北路一带"},{"k":"模特","v":"阿岚（第三次合作）"},{"k":"器材","v":"5D4 + 35mm f/1.4"},{"k":"张数","v":"拍了 1,240 张，留下 18 张"}]', '["我在同一个路口等过三次红灯，三次都看见同样的东西：雨停以后地面把霓虹拉成长条，人站在里面，像被泡在显影液里。那种光不亮，也不暖，但它会把人的轮廓收得很干净。","我想拍的正是这个「还没开始表演」的状态。不是街拍，也不是棚拍，是我先站进去，再请她走进来。"]', '["你别急着按，等我先忘了你在。","阿岚在第一次拍摄时说的"]', '["我们认识在一场朋友的生日会上。她说她不喜欢被拍，因为「照片里的我总在笑」。我说那这次我们就不笑。","第三次合作才是这一组。她带着一把透明伞来，从十点拍到十二点，中间在便利店买了两罐热咖啡。最后一张我拍的是她低头开罐子的侧脸，也是这组里我自己最喜欢的一张。"]', '["拍到第十一张的时候，路过的外卖员停下来问我们在拍什么。她说：在拍下班。",""]', '[{"k":"前期","v":"在同一个街区走了三个晚上，记下雨后反光最好的四个位置。"},{"k":"造型","v":"不做造型。毛衣是她自己的，伞是我的。"},{"k":"器材","v":"全程 f/1.4 到 f/2，只用环境光和一盏便利店的顶灯。"},{"k":"节奏","v":"每拍二十分钟休息一次，让她把手机拿出来刷一会儿。"},{"k":"收尾","v":"十二点整收工，最后一班地铁还赶得上。"}]', '[{"img":"/media/pt-550.jpg","alt":"黄昏的天台上，她背对镜头看城市","cap":"天台上 · 18:40"},{"img":"/media/pt-821.jpg","alt":"站台，一列车模糊地驶过","cap":"站台 · 19:20"}]', '[{"img":"/media/pt-497.jpg","alt":"逆光里，风把她的头发吹起来","cap":"逆光 · 20:05"}]', 0, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (2, 'wall', '白墙与午后', '/media/pt-832.jpg', '窗边，一个女孩低头读一本书，光落在她的侧脸上', 2025, '我想证明一件事：一面白墙加一扇朝西的窗，就够拍一组人像了。家具全部搬到了走廊上。', '["2025 · 十二张","模特 小满","我家客厅"]', '[{"k":"年份","v":"2025 年 9 月"},{"k":"地点","v":"我家客厅（搬空以后）"},{"k":"模特","v":"小满（第一次见面）"},{"k":"器材","v":"5D4 + 50mm f/1.8"},{"k":"张数","v":"拍了 480 张，留下 12 张"}]', '["棚拍那一套我学不会：灯、柔光箱、反光板，每加一件东西，人就更像在上班。我想试试只用一个变量：时间。","下午两点的光太平，三点的光开始有方向，四点半的时候它会从她耳朵后面穿过来。我等的是四点半。"]', '["光只有一个方向，人也只需要一个表情。","拍摄笔记，2025.09.14"]', '["小满是第一个在网上看到我的照片、主动约拍的陌生人。她来的时候带了一本《夜航西飞》，说「可以在等待的时候看」。","前两个小时我们只是在聊天，聊她正在读的书和她的猫。第三个小时我才把相机拿出来，那时候她已经忘了要「拍得好看」这件事。"]', '["她说：原来拍照是不用笑的啊。",""]', '[{"k":"时间","v":"14:00 到 17:40，全程跟着西窗的光走。"},{"k":"布景","v":"白墙、一把木椅、一本摊开的书。没有别的。"},{"k":"器材","v":"50mm 定焦，f/1.8 全开，不用补光。"},{"k":"沟通","v":"前两个小时不拍，只聊天。"},{"k":"收尾","v":"太阳落下去就收工，不留到「再拍一张」。"}]', '[{"img":"/media/pt-1009.jpg","alt":"大片天空下，她仰起头","cap":"仰头 · 15:10"},{"img":"/media/pt-1006.jpg","alt":"她在窗边翻书，光在书页上","cap":"书页 · 16:20"}]', '[{"img":"/media/pt-375.jpg","alt":"黄昏，她坐在白色雏菊丛里","cap":"黄昏 · 17:40"}]', 1, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (3, 'fog', '雾里的她', '/media/pt-1014.jpg', '雾里，一个女孩背对着镜头望向海面', 2025, '雾是最好的背景板：它把世界擦成一张白纸，只留下人。这一组四点半出发，六点整开拍。', '["2025 · 九张","模特 周舟","千岛湖 · 北岸"]', '[{"k":"年份","v":"2025 年 11 月"},{"k":"地点","v":"千岛湖 · 北岸"},{"k":"模特","v":"周舟（第二次合作）"},{"k":"器材","v":"5D4 + 85mm f/1.8"},{"k":"张数","v":"拍了 96 张，留下 9 张"}]', '["城市里拍照，背景总在抢戏：招牌、车、路人。雾一上来，这些都消失了，画面里只剩下一件事：她的表情。","代价是雾也不会等你。六点最厚，六点四十光就硬了，中间只有四十分钟。"]', '["雾把世界调成静音，剩下的声音就只有快门。","拍摄笔记，2025.11.02"]', '["周舟是第二次合作，上一次拍的是晚上的城市。这次她穿了一件很薄的衬衫，在六度的雾里站了四十分钟。","中间我给她披了三次外套，每次披上她就笑，说「再拍两张就还给你」。第九张是她把外套裹到下巴，只露出一双眼睛的那张。"]', '["她说：冷是冷，但我不想停。",""]', '[{"k":"出发","v":"04:30 从杭州出发，车上睡了一路。"},{"k":"踩点","v":"05:40 到湖边，先走一圈找背风的位置。"},{"k":"器材","v":"一支 85mm，全程 f/2.8，高感开到 800。"},{"k":"时间","v":"06:00 到 06:40，雾散就收。"},{"k":"后期","v":"只调了灰度和对比，没有磨皮。"}]', '[{"img":"/media/pt-726.jpg","alt":"雪雾里，一抹红","cap":"红衣 · 06:05"},{"img":"/media/pt-669.jpg","alt":"雾里穿芥末色外套的背影","cap":"背影 · 06:20"}]', '[{"img":"/media/pt-1005.jpg","alt":"系着围巾，望向海面","cap":"围巾 · 06:35"}]', 2, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (4, 'rain', '雨停之前', '/media/pt-22.jpg', '雨后的路口，一个人走过斑马线', 2026, '雨还没停的那半小时，整条街只剩伞和倒影。所有人挤在屋檐下等，城市第一次慢下来。', '["2026 · 十一张","模特 阿青","杭州 · 武林路"]', '[{"k":"年份","v":"2026 年 6 月"},{"k":"地点","v":"杭州 · 武林路到凤起路"},{"k":"模特","v":"阿青（第一次合作）"},{"k":"器材","v":"5D4 + 35mm f/1.8"},{"k":"张数","v":"拍了 640 张，留下 11 张"}]', '["我拍过很多夜景，但雨夜是另一种：地面变成第二块银幕，灯被拉长，人影变成一条。人在里面走，像在洗一张照片。","我不想用闪光灯把雨丝照亮。路灯、车灯、店招，就这三样，让雨自己发亮。"]', '["雨是免费的柔光箱，只是它不听话。","拍摄笔记，2026.06.18"]', '["阿青是在洗车店门口认识的。她在等雨小一点，手里拎着一把伞骨已经弯掉的伞。我说我在拍这条街，她说那正好，我这把伞很好看。","我们从九点拍到十一点，雨从大雨变成毛毛雨。最后一张是她把伞收起来，抬头看路灯的那一下，头发全湿了，她也没管。"]', '["她说：伞坏了正好，反正我也不想遮。",""]', '[{"k":"时间","v":"21:00 到 23:00，只拍雨停前后的那段。"},{"k":"地点","v":"从武林路走到凤起路，三个路口。"},{"k":"器材","v":"35mm，f/1.8 全开，ISO 1600，不带灯。"},{"k":"沟通","v":"不规定路线，让她自己决定在哪停。"},{"k":"后期","v":"只压了一点高光，雨丝留着。"}]', '[{"img":"/media/pt-349.jpg","alt":"路灯下，屋檐边站着一个人","cap":"屋檐 · 21:20"},{"img":"/media/pt-473.jpg","alt":"雨里伸进湖面的木栈道","cap":"水边 · 22:05"}]', '[{"img":"/media/pt-497.jpg","alt":"雨停之后，风把她的头发吹干了一半","cap":"收伞 · 22:50"}]', 3, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (5, 'cloud', '云上', '/media/pt-685.jpg', '云海之上，一个人坐在岩石边看向日出', 2024, '把人放进一整片云里，背景就没有了。日出前四十分钟是唯一的窗口，我们等了三个早上。', '["2024 · 八张","模特 小满","黄山 · 光明顶"]', '[{"k":"年份","v":"2024 年 10 月"},{"k":"地点","v":"黄山 · 光明顶"},{"k":"模特","v":"小满（第二次合作）"},{"k":"器材","v":"5D4 + 35mm f/2"},{"k":"张数","v":"拍了 210 张，留下 8 张"}]', '["城市人像的背景永远是墙、车、招牌。我想看看把人放进一整片云里，他还剩多少表情。","山上没有可控的光：四点半开始亮，五点二十日出，六点云就涌上来把山盖掉。等了三早上，只有第二天是干净的。"]', '["山不会配合你，所以只能你配合山。","拍摄笔记，2024.10.03"]', '["小满上山时背了三个镜头，最后一个也没用上，因为风太大，换镜头等于换进一把沙。","她戴了我的手套，在风口站了四十分钟。中间我把自己的外套也给她了，她说不用，说「再站一会儿就习惯了」。"]', '["她说：冷到一定程度就不冷了，只剩下想拍好。",""]', '[{"k":"踩点","v":"前一天下午上去，先看第二天日出的方向。"},{"k":"出发","v":"04:00 从住处出发，头灯上山。"},{"k":"器材","v":"一支 35mm，f/2 到 f/5.6，不带备用镜头。"},{"k":"保暖","v":"两双手套、一件冲锋衣，谁冷谁穿。"},{"k":"收尾","v":"云涌上来就下山，不硬等。"}]', '[{"img":"/media/pt-177.jpg","alt":"山脊上，一个背着包的人望向山谷","cap":"山脊 · 06:10"},{"img":"/media/pt-447.jpg","alt":"湖边石墙上站着一个人，面向远山","cap":"石墙 · 06:35"}]', '[{"img":"/media/pt-1009.jpg","alt":"大片天空下，一个人的后脑","cap":"天空 · 06:52"}]', 4, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (6, 'corridor', '走廊尽头', '/media/pt-91.jpg', '黑白照片：一个人站在走廊里，低头看手里的相机', 2024, '一栋要拆的老公寓，走廊里只有尽头一扇窗。一卷三十六张的黑白，留下七张。', '["2024 · 七张","模特 阿岚","杭州 · 老邮局宿舍"]', '[{"k":"年份","v":"2024 年 3 月"},{"k":"地点","v":"杭州 · 老邮局宿舍（已拆）"},{"k":"模特","v":"阿岚（第一次合作）"},{"k":"器材","v":"FM2 + 50mm f/1.4 · 黑白胶片"},{"k":"张数","v":"一卷 36 张，留下 7 张"}]', '["那条走廊只有一个光源：尽头一扇窗。人往里走，脸就慢慢没了，只剩轮廓。我想拍的就是这个过程。","用胶片是因为它慢。三十六张，每按一次都要想一下，这种限制对拍摄是好事。"]', '["黑白不是去掉颜色，是把注意力放到光上。","拍摄笔记，2024.03.09"]', '["房东是我们共同的朋友，把钥匙借给我们两个小时。走廊很窄，两个人几乎不能同时转身，只能一个在里一个在外。","拍到第二十张的时候，她开始不看镜头了，低头研究我手里的相机。那张是这组里唯一一张她在笑的。"]', '["她说：这栋楼下个月就没了，你多拍几张墙。",""]', '[{"k":"地点","v":"朋友介绍的空置公寓，拍完一个月后拆除。"},{"k":"器材","v":"尼康 FM2，50mm f/1.4，伊尔福 HP5。"},{"k":"测光","v":"只按窗户测，人欠一档，暗部就让它黑。"},{"k":"时间","v":"下午三点到五点，光的角度最低。"},{"k":"冲洗","v":"自己冲的，D-76 一比一，扫成 4000 长边。"}]', '[{"img":"/media/pt-1005.jpg","alt":"走廊尽头，一个背影停在窗前","cap":"窗前 · 15:40"},{"img":"/media/pt-1014.jpg","alt":"窗光里，她回头看的一瞬","cap":"回头 · 16:10"}]', '[{"img":"/media/pt-550.jpg","alt":"临走前，她站在楼梯口","cap":"楼梯口 · 17:05"}]', 5, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');
INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (7, 'empty', '空椅子', '/media/pt-768.jpg', '沙丘之间，一个人独自坐在长椅上', 2025, '这一组几乎没有正脸。她说想拍「一个人的时候是什么样子」，我说那就不看你。', '["2025 · 六张","模特 周舟","舟山 · 东沙"]', '[{"k":"年份","v":"2025 年 5 月"},{"k":"地点","v":"舟山 · 东沙"},{"k":"模特","v":"周舟（第三次合作）"},{"k":"器材","v":"5D4 + 85mm f/1.8"},{"k":"张数","v":"按了 60 次，留下 6 张"}]', '["人最像自己的时候，是以为没人在看的时候。所以我让她一个人走，走远了再按。","不安排动作，只安排距离：二十米、五十米、一百米。距离越远，人越像一个小点，反而越像她自己。"]', '["不看她，才看得见她。","拍摄笔记，2025.05.24"]', '["周舟说这是她拍得最舒服的一次，因为不用管表情。我们在沙滩上走了两个小时，中间几乎没有说话。","有一段她走得太远，我差点喊她回来，最后没有喊。那张糊了，但我留下了。"]', '["她说：你刚才是不是想叫我？我说是。她说：还好你没叫。",""]', '[{"k":"距离","v":"20 米、50 米、100 米，三个段落。"},{"k":"沟通","v":"只说一句「你随便走」，其余时间不喊停。"},{"k":"器材","v":"85mm，f/2.8，让环境留一点。"},{"k":"时间","v":"18:00 到 19:20，等太阳贴近海面。"},{"k":"取舍","v":"糊掉的那张也留下，它最像我记忆里的样子。"}]', '[{"img":"/media/pt-768.jpg","alt":"沙丘之间，她坐在一张空长椅上","cap":"长椅 · 18:10"},{"img":"/media/pt-1006.jpg","alt":"岩石上，她望向雾里的山谷","cap":"岩石 · 18:40"}]', '[{"img":"/media/pt-1011.jpg","alt":"湖面上，她一个人划着船","cap":"船 · 19:05"}]', 6, 1, '2026-09-01 12:00:00', '2026-09-01 12:00:00');

-- 说说
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (1, '2026-10-28 01:12:00', 'write', '写字', '["把《把博客当成一间屋子》那篇写完了，凌晨一点。窗外在下雨，楼下的便利店还亮着。"]', '["/media/ph-rain.jpg"]', 1, '2026-10-28 01:12:00', '2026-10-28 01:12:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (2, '2026-10-21 23:40:00', 'photo', '摄影', '["买了一卷富士 C200，涨价涨得离谱。还是买了。"]', '[]', 1, '2026-10-21 23:40:00', '2026-10-21 23:40:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (3, '2026-10-12 00:36:00', 'tech', '技术', '["Node 流那篇发出去以后，有人来信说我背压那段写错了。确实错了，改了，谢谢他。"]', '[]', 1, '2026-10-12 00:36:00', '2026-10-12 00:36:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (4, '2026-09-30 21:50:00', 'life', '生活', '["公司楼下新开了一家面馆，十点半还开着。加班的人有救了。"]', '["/media/ph-umbrella.jpg"]', 1, '2026-09-30 21:50:00', '2026-09-30 21:50:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (5, '2026-09-26 02:03:00', 'tech', '技术', '["部署脚本的坑终于整理成了清单，十六条。写完发现第十二条是我自己挖的。"]', '[]', 1, '2026-09-26 02:03:00', '2026-09-26 02:03:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (6, '2026-09-14 23:18:00', 'read', '读书', '["第三次重读《夜晚的潜水艇》。这次注意到的是那些停顿的句子：陈春成很会用句号。"]', '["/media/cover-submarine.jpg"]', 1, '2026-09-14 23:18:00', '2026-09-14 23:18:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (7, '2026-08-30 01:47:00', 'tech', '技术', '["Rust 版生成器跑通了，构建 11 秒。为了这 81 秒，我花掉了三个周末。"]', '["/media/ph-spiral.jpg","/media/ph-lightwell.jpg"]', 1, '2026-08-30 01:47:00', '2026-08-30 01:47:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (8, '2026-08-11 22:30:00', 'photo', '摄影', '["把胶片机带去上班，同事问这是不是拍立得。我说是二十年前的数码相机。"]', '[]', 1, '2026-08-11 22:30:00', '2026-08-11 22:30:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (9, '2026-07-29 23:55:00', 'read', '读书', '["在终端里读完了《局外人》。没有页码的感觉很奇怪，但记住的东西反而更多。"]', '[]', 1, '2026-07-29 23:55:00', '2026-07-29 23:55:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (10, '2026-07-06 01:30:00', 'photo', '摄影', '["冬夜路灯那篇，写完才发现有张照片拍糊了。想了想，还是放上去了。糊掉的那张最像我记忆里的样子。"]', '["/media/cover-lamp.jpg"]', 1, '2026-07-06 01:30:00', '2026-07-06 01:30:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (11, '2026-06-18 20:12:00', 'life', '生活', '["有人从友链过来，写信说喜欢这站的安静。这大概是我今年收到最好的一句话。"]', '[]', 1, '2026-06-18 20:12:00', '2026-06-18 20:12:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (12, '2026-05-22 01:08:00', 'tech', '技术', '["构建时间压到 11 秒那天，我请自己吃了一顿火锅。凌晨一点，只有我和店员。"]', '[]', 1, '2026-05-22 01:08:00', '2026-05-22 01:08:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (13, '2026-04-09 22:40:00', 'tech', '技术', '["搬回抽屉里的旧笔记本。机房的风扇声消失了，家里多了一点电流声。"]', '["/media/cover-deploy.jpg"]', 1, '2026-04-09 22:40:00', '2026-04-09 22:40:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (14, '2026-03-15 04:20:00', 'read', '读书', '["地坛那篇是凌晨四点写的。写到一半天亮了，就停下来去看窗外。"]', '[]', 1, '2026-03-15 04:20:00', '2026-03-15 04:20:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (15, '2025-12-31 23:59:00', 'life', '生活', '["今年写了十一篇，拍了三千多张，删掉九成。"]', '[]', 1, '2025-12-31 23:59:00', '2025-12-31 23:59:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (16, '2025-11-07 22:15:00', 'photo', '摄影', '["雾与静水那组是四点半起床拍的。六点雾最厚，七点就散了。"]', '["/media/ph-marker.jpg"]', 1, '2025-11-07 22:15:00', '2025-11-07 22:15:00');
INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (17, '2025-08-19 01:26:00', 'photo', '摄影', '["开始试着用胶片拍夜景。第一卷全废了，第二卷有两张能看。"]', '[]', 1, '2025-08-19 01:26:00', '2025-08-19 01:26:00');

-- 项目
INSERT INTO project (id, title, status, progress, summary, period, spec, images, tags, sort_order, published, created_at, updated_at) VALUES (1, '拂晓 · 本站', '进行中', 65, '一个不依赖框架的静态博客：手写 HTML/CSS/JS，一套图片管线负责把原图转成四种尺寸，构建时间十一秒。插图是二次元的书封，摄影是黑底的影集。', '2026 年 3 月至今', '["HTML / CSS / 原生 JS","影调：全套银盐灰阶","自建图片管线 + WebP","无追踪、无第三方脚本"]', '["/media/cover-deploy.jpg","/media/ph-lightwell.jpg"]', '["web"]', 0, 1, '2026-08-01 10:00:00', '2026-08-01 10:00:00');
INSERT INTO project (id, title, status, progress, summary, period, spec, images, tags, sort_order, published, created_at, updated_at) VALUES (2, 'ossia', '进行中', 30, '本地优先的笔记同步：CRDT 合并、离线可用、冲突可见。目标是把「我的笔记在谁的服务器上」这个问题彻底取消。', '2026 年 1 月至今', '["Rust + CRDT","SQLite 落盘","Tauri 桌面端","端到端加密"]', '["/media/cover-stream.jpg","/media/ph-spiral.jpg"]', '["rust","桌面"]', 1, 1, '2026-08-01 10:00:00', '2026-08-01 10:00:00');
INSERT INTO project (id, title, status, progress, summary, period, spec, images, tags, sort_order, published, created_at, updated_at) VALUES (3, '一期一会', '搁置', 0, '胶片扫描与色彩还原工具：负片反相、去色罩、按胶片型号套用曲线。停在了色彩管理这一步。', '2025 年 6 月至 12 月', '["Rust","ICC 配置文件","TIFF 16bit","还在等一个好的色彩库"]', '["/media/cover-film.jpg","/media/ph-jetty.jpg"]', '["rust","图像"]', 2, 1, '2026-08-01 10:00:00', '2026-08-01 10:00:00');
INSERT INTO project (id, title, status, progress, summary, period, spec, images, tags, sort_order, published, created_at, updated_at) VALUES (4, '光谱', '进行中', 45, '音频可视化实验：把一段录音的频谱摊平成可以走进去的空间。目前只在深夜听得下去。', '2025 年 9 月至今', '["WebAudio","WebGL","FFT 实时分析","键盘可控"]', '["/media/cover-rust.jpg","/media/ph-cathedral.jpg"]', '["web","音频"]', 3, 1, '2026-08-01 10:00:00', '2026-08-01 10:00:00');

-- 还没开始的项目
INSERT INTO upcoming_project (id, title, note, sort_order, visible, created_at) VALUES (1, '把冲扫流程写成脚本', '停在色彩管理', 0, 1, NOW());
INSERT INTO upcoming_project (id, title, note, sort_order, visible, created_at) VALUES (2, '一个只读 RSS 的阅读器', '想清楚之前不动手', 1, 1, NOW());
INSERT INTO upcoming_project (id, title, note, sort_order, visible, created_at) VALUES (3, '给影集做一个可分享的排版器', '等这本册子做满', 2, 1, NOW());

-- 照片
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (1, '读书的人', 'f/1.8 · 1/125s · ISO 400 · 35mm', '/media/pt-832.jpg', '窗边读一本书的女孩', 'wall', NULL, 0, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (2, '火花', 'f/2 · 1/60s · ISO 800 · 35mm', '/media/pt-660.jpg', '捧着仙女棒的女孩', 'wall', NULL, 1, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (3, '天台上', 'f/1.4 · 1/30s · ISO 1600 · 35mm', '/media/pt-550.jpg', '黄昏时分天台上的女孩', 'wall', NULL, 2, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (4, '逆光', 'f/2.8 · 1/250s · ISO 200 · 50mm', '/media/pt-497.jpg', '逆光里的背影，头发被风吹起', 'wall', NULL, 3, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (5, '站台', 'f/2 · 1/60s · ISO 800 · 35mm', '/media/pt-821.jpg', '站台上，一列车模糊驶过', 'wall', NULL, 4, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (6, '海的背面', 'f/2.8 · 1/500s · ISO 100 · 50mm', '/media/pt-1014.jpg', '雾里望向海面的女孩', 'wall', NULL, 5, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (7, '围巾', 'f/1.8 · 1/80s · ISO 400 · 55mm', '/media/pt-1005.jpg', '系着围巾、背对镜头看向海面的人', 'wall', NULL, 6, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (8, '雾里', 'f/4 · 1/200s · ISO 200 · 35mm', '/media/pt-669.jpg', '雾里穿芥末色外套的背影', 'wall', NULL, 7, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (9, '雪地', 'f/2.8 · 1/250s · ISO 200 · 35mm', '/media/pt-726.jpg', '雪雾里穿红外套的人', 'wall', NULL, 8, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (10, '黄昏', 'f/2 · 1/60s · ISO 800 · 35mm', '/media/pt-375.jpg', '黄昏里坐在白色雏菊丛中的人', 'wall', NULL, 9, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (11, '天空', 'f/5.6 · 1/500s · ISO 100 · 24mm', '/media/pt-1009.jpg', '大片天空下，一个人的后脑', 'wall', NULL, 10, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (12, '岩石', 'f/2.8 · 1/125s · ISO 200 · 50mm', '/media/pt-1006.jpg', '岩石上望向雾中山谷的人', 'wall', NULL, 11, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (13, '带琴的人', '2025.11.03 · 06:38 · f/2.8', '/media/pt-334.jpg', '黑白照片：一个人背着电吉他走过沙丘', 'scatter', '2025-11-03', 0, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (14, '等她走过来', '2026.05.20 · 19:04 · f/1.8', '/media/pt-447.jpg', '湖边石墙上站着一个人，面向远山', 'scatter', '2026-05-20', 1, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (15, '水边', '2026.04.02 · 18:20 · f/4', '/media/pt-473.jpg', '伸进湖面的木栈道尽头站着一个人', 'scatter', '2026-04-02', 2, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (16, '路灯', '2026.09.14 · 22:47 · f/2', '/media/pt-349.jpg', '海堤上坐着一个人，望向模糊的天际线', 'scatter', '2026-09-14', 3, 1, '2026-09-01 10:00:00');
INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (17, '船', '2025.06.28 · 17:12 · f/5.6', '/media/pt-1011.jpg', '湖面上，一个人划着独木舟', 'scatter', '2025-06-28', 4, 1, '2026-09-01 10:00:00');

-- 友链
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (1, '林深见鹿', 'lsjl.me', 'https://lsjl.me', '写 Rust 和爬山的女生，每篇都有大段的山里照片。', NULL, 0, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (2, '玻璃罐头', 'canned.glass', 'https://canned.glass', '一个把读书笔记做成杂志的站，排版值得偷。', NULL, 1, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (3, '南窗', 'nanchuang.ink', 'https://nanchuang.ink', '只在夜里更新，写城市、地铁和失眠。', NULL, 2, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (4, '浮点数', 'float.pub', 'https://float.pub', '前端老手，最近的系列是把 CSS 讲成散文。', NULL, 3, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (5, '无人区', 'no-mans.land', 'https://no-mans.land', '一个人骑车穿过西北的记录，图和字都极好。', NULL, 4, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (6, '拾光', 'shiguang.photo', 'https://shiguang.photo', '摄影前辈，暗房还在自己冲。', NULL, 5, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (7, '纸飞机', 'paperplane.im', 'https://paperplane.im', '结构工程师，写桥，也拍桥。', NULL, 6, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (8, '半野', 'halfwild.org', 'https://halfwild.org', '自然笔记，认植物认得比我还准。', NULL, 7, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (9, '夜航日志', 'nightlog.cc', 'https://nightlog.cc', '和我同名的站，写的却是天文。', NULL, 8, 1, '2026-08-01 10:00:00');
INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (10, '小满', 'xiaoman.day', 'https://xiaoman.day', '一年只写十二篇，每篇都好。', NULL, 9, 1, '2026-08-01 10:00:00');

-- 归档
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (1, '2026-10-28', '把博客当成一间屋子来设计', '技术随笔', 1, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (2, '2026-10-12', 'Node 里的流：一个缓慢的理解过程', '技术随笔', 2, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (3, '2026-09-26', '深夜的部署脚本与它的十六个坑', '技术随笔', 4, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (4, '2026-09-14', '《夜晚的潜水艇》与不可抵达的地方', '读书', 3, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (5, '2026-08-30', '用 Rust 重写一个静态站点生成器', '技术随笔', 5, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (6, '2026-08-11', '胶片给我的三个技术隐喻', '摄影随笔', 6, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (7, '2026-07-29', '在终端里读完一本书', '生活', 7, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (8, '2026-07-06', '冬夜的路灯与它的色温', '摄影随笔', 8, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (9, '2026-06-18', '写给还没开始写博客的人', '生活', 9, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (10, '2026-05-22', '把构建时间从 92 秒压到 11 秒', '技术随笔', 10, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (11, '2026-04-09', '一次搬家：从云主机到自己家的旧笔记本', '技术随笔', 11, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (12, '2026-03-15', '读《我与地坛》：与遗憾慢慢和解', '读书', 12, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (13, '2025-12-24', '雾与静水：一组凌晨四点半的照片', '摄影随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (14, '2025-11-02', '把相机带进办公室的第一天', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (15, '2025-10-19', '用 SQLite 当缓存的一百天', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (16, '2025-09-07', '读完《局外人》的晚上', '读书', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (17, '2025-08-15', '第一卷胶片，全废了', '摄影随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (18, '2025-07-03', '为什么我不再用 CSS 框架', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (19, '2025-05-28', '给五年前的自己回一封信', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (20, '2025-03-11', '重读《窄门》', '读书', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (21, '2025-01-20', '把服务器搬进抽屉', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (22, '2024-12-30', '写博客第七年', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (23, '2024-11-12', '一个关于颜色的实习', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (24, '2024-09-21', '雨天在河边坐了两小时', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (25, '2024-07-18', '类型系统帮我改掉的三个坏习惯', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (26, '2024-06-02', '第一次拍夜景，手抖得厉害', '摄影随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (27, '2024-04-15', '读《人间失格》', '读书', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (28, '2024-03-09', '把博客的主题色改了十一次', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (29, '2024-01-28', '关于「每天写一点」的实验报告', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (30, '2023-12-11', '第一次自己冲黑白卷', '摄影随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (31, '2023-10-04', '把博客从 Jekyll 搬到自己的脚本', '技术随笔', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (32, '2023-08-06', '梅雨季的窗口', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (33, '2023-06-19', '读《克拉拉与太阳》', '读书', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (34, '2023-04-02', '关于「每天写一点」的一点怀疑', '生活', NULL, NOW());
INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES (35, '2023-01-15', '三十岁那年我重新开始写字', '生活', NULL, NOW());

-- 关于
INSERT INTO about_profile (id, display_name, subtitle, meta, portrait, portrait_alt, portrait_caption, bio, cols, credits, email, github, twitter, updated_at) VALUES (1, '拂晓', '前端工程师 · 杭州', '杭州 · 一个人 · 一周一篇', '/media/portrait-alt.jpg', '雾天窗前的人影，站在钢架与天光之间', '这张是朋友拍的，雾天，我家窗前。', '["我叫拂晓。白天在写字楼里写前端，晚上回到这间屋子，写点不交付给任何人的东西。","写代码是十年了。从 jQuery 写到 React，又从 React 写回原生：不是叛逆，只是发现很多问题用不着那么重的东西。现在的工作主要和设计系统、构建流程打交道，成天在\\"这个组件该由谁负责\\"这类问题上打转。","拍照是更早的事。大学时用一台二手胶片机拍宿舍楼下的树，拍完拿去冲扫，等三天。那种等待大概塑造了我对这个站的态度：慢一点没关系，只要最后那张是对的。","这个站没有评论、没有广告、没有统计代码。写它是为了把一个想法想清楚，顺便留个地方给十年后的自己。如果你也在写，欢迎写信来，我每一封都看。"]', '[{"title":"手上的东西","items":["富士 X100V 日常","尼康 FM2 + 50mm 胶片","HHKB Pro 2 打字","一台 2019 年的笔记本 服务器","Neovim，用了六年 编辑器"]},{"title":"时间线","items":["2019 写下第一篇，用 WordPress","2021 搬到杭州，站改成静态","2023 开始自己冲扫胶片","2024 加了摄影板块","2026 把服务器搬回抽屉"]},{"title":"联系","items":["470379769@qq.com","github.com/dengxia","@dengxia_moe","RSS 订阅","不接商业合作"]}]', '["照片来自 Unsplash（Unsplash License，可商用、需署名）。人像部分取自同一图库，它们是占位素材，等我自己拍够一组就换掉。影集里的模特姓名、故事与 EXIF 都是示例，不是这些照片的真实信息。","六张二次元插图为本站用 AI 图像生成制作的占位图（非 Unsplash 素材）：深夜书桌、末班电车、台灯下的书、屏幕的冷光、暗房显影、雨夜便利店。字体是 Noto Serif SC 与 JetBrains Mono。","Next.js · React Router · Tailwind CSS · GSAP — 2026 年重写"]', '470379769@qq.com', 'github.com/dengxia', '@dengxia_moe', NOW());

-- 站点文案
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (1, 'site.name', 'site', '站点名称', '拂晓和朋友们', 'text', 0, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (2, 'site.subtitle', 'site', '站点副题', '秦川逐雪', 'text', 1, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (3, 'site.description', 'site', '站点描述', '所有未熄的热爱 — 技术、摄影与生活的个人文集。', 'text', 2, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (4, 'site.url', 'site', '站点地址', 'https://fuxiao.art', 'text', 3, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (5, 'site.email', 'site', '联系邮箱', '470379769@qq.com', 'text', 4, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (6, 'site.icp', 'site', '备案号', '苏ICP备2022037935号', 'text', 5, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (7, 'site.startedAt', 'site', '建站时刻', '2017-04-07 04:45', 'text', 6, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (8, 'home.hero.brand', 'home', '首屏左侧标记', 'EST. 2017', 'text', 7, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (9, 'home.hero.city', 'home', '首屏城市', 'SHANGHAI', 'text', 8, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (10, 'home.hero.index', 'home', '首屏右上角栏目号', '01 / 首页
记录 · 技术 · 摄影', 'textarea', 9, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (11, 'home.hero.title', 'home', '首屏主标题', '拂晓和朋友们', 'text', 10, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (12, 'home.hero.subtitle', 'home', '首屏副标题', '所有未熄的热爱。', 'text', 11, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (13, 'home.hero.cta', 'home', '首屏主按钮', '读最新的一篇', 'text', 12, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (14, 'home.hero.darkroom', 'home', '首屏次按钮', '进暗房', 'text', 13, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (15, 'home.hero.update', 'home', '首屏更新提示', '最近更新 2026.10.28', 'text', 14, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (16, 'home.hero.note', 'home', '首屏篇数提示', '第 47 篇 · 写于凌晨一点', 'text', 15, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (17, 'home.writing.title', 'home', '精选书写标题', '精选书写', 'text', 16, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (18, 'home.writing.aside', 'home', '精选书写说明', '不是点得最多的，是我自己还会回头看的。技术、读书、生活，各挑了一篇。', 'textarea', 17, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (19, 'home.photo.title', 'home', '摄影区块标题', '在暗处
才开始显影', 'textarea', 18, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (20, 'home.photo.aside', 'home', '摄影区块说明', '我拍人像，多数是女孩。七个影集、七十一张，都拍在太阳落下去以后。
纸面上看照片是灰的，进到暗房里才有颜色。', 'textarea', 19, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (21, 'home.photo.cta', 'home', '摄影区块按钮', '推开暗房的门', 'text', 20, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (22, 'home.photo.meta', 'home', '摄影区块脚注', '71 张 · 7 个影集 · 2024—2026', 'text', 21, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (23, 'home.moments.title', 'home', '说说区块标题', '最近说说', 'text', 22, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (24, 'home.moments.aside', 'home', '说说区块说明', '短的东西写在短的地方。一条一句，偶尔带一张照片。', 'textarea', 23, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (25, 'home.projects.title', 'home', '项目区块标题', '正在做的事', 'text', 24, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (26, 'home.projects.aside', 'home', '项目区块说明', '动手的部分。有的快好了，有的停在半路。', 'textarea', 25, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (27, 'articles.head.lede', 'articles', '文章页引言', '写技术，也写读书和生活。多数是在晚上写的，第二天早上改一遍，然后发出来。', 'textarea', 26, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (28, 'articles.head.meta', 'articles', '文章页统计', '12 篇 · 2019—2026', 'text', 27, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (29, 'articles.more', 'articles', '文章页页脚说明', '更早的文章按年份收在归档里。', 'text', 28, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (30, 'photography.head.lede', 'photography', '摄影页引言', '我拍人像，多数是女孩。七个影集、七十一张，都拍在太阳落下去以后。
这里没有别的，只有光、表情，和一个不太会说话的人。', 'textarea', 29, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (31, 'photography.head.meta', 'photography', '摄影页统计', '71 张照片 · 7 个影集
2024.03 — 2026.10', 'textarea', 30, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (32, 'photography.albums.title', 'photography', '影集标题', '影集', 'text', 31, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (33, 'photography.scatter.title', 'photography', '散图标题', '散图', 'text', 32, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (34, 'photography.wall.title', 'photography', '全部作品标题', '全部作品', 'text', 33, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (35, 'photography.scatter.note', 'photography', '散图说明', '散图不进影集：试光、收工前最后一张、忘了为什么按的。点开看大图，方向键翻。', 'textarea', 34, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (36, 'photography.closing.title', 'photography', '摄影页收尾标题', '纸面上是灰的，
只有在暗房里才有颜色。', 'textarea', 35, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (37, 'photography.closing.text', 'photography', '摄影页收尾说明', '整站只有这一处上色。想回到文字那一侧，走廊在左边：技术、读书、生活都在那儿。', 'textarea', 36, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (38, 'photography.closing.cta', 'photography', '摄影页收尾按钮', '回到书写', 'text', 37, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (39, 'moments.head.lede', 'moments', '说说页引言', '短的东西写在短的地方。一条一句，偶尔带一张照片。标签可以点，点完只看那一类。', 'textarea', 38, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (40, 'projects.head.lede', 'projects', '项目页引言', '动手的那部分。有的是给自己造的工具，有的是为了弄明白一件事。状态都写在上面，不美化。', 'textarea', 39, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (41, 'projects.upcoming.title', 'projects', '未开始清单标题', '还没开始的', 'text', 40, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (42, 'archive.head.lede', 'archive', '归档页引言', '全部文章按年份排。标题、日期、分类，没有摘要也没有缩略图，翻起来快。', 'textarea', 41, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (43, 'friends.head.lede', 'friends', '友链页引言', '十个还在写的人。都是我自己会去读的站，不做互相导流的生意，也不换流量。', 'textarea', 42, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (44, 'friends.apply.title', 'friends', '友链申请标题', '想交换链接', 'text', 43, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (45, 'friends.apply.text', 'friends', '友链申请说明', '写信到 470379769@qq.com，把站名、地址和一句介绍给我。我大约每两周看一次信箱，通过了会在这页加上。', 'textarea', 44, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (46, 'friends.apply.self', 'friends', '本站可用信息', '我这边可以用的信息：站名「拂晓和朋友们」，地址 fuxiao.art，一句介绍「在月光下，记录所有未熄的热爱」。', 'textarea', 45, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (47, 'about.head.lede', 'about', '关于页引言', '拂晓，前端工程师，住在杭州。这个站从 2019 年写到现在，没有换过域名，也没有换过主题。', 'textarea', 46, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (48, 'about.head.meta', 'about', '关于页统计', '杭州 · 一个人 · 一周一篇', 'text', 47, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (49, 'about.credits.title', 'about', '图片来源标题', '图片来源', 'text', 48, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (50, 'about.credits.body1', 'about', '图片来源说明一', '照片来自 Unsplash（Unsplash License，可商用、需署名）。人像部分取自同一图库，它们是占位素材，等我自己拍够一组就换掉。影集里的模特姓名、故事与 EXIF 都是示例，不是这些照片的真实信息。', 'textarea', 49, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (51, 'about.credits.body2', 'about', '图片来源说明二', '六张二次元插图为本站用 AI 图像生成制作的占位图（非 Unsplash 素材）：深夜书桌、末班电车、台灯下的书、屏幕的冷光、暗房显影、雨夜便利店。字体是 Noto Serif SC 与 JetBrains Mono。', 'textarea', 50, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (52, 'about.credits.stack', 'about', '关于页技术落款', 'Next.js · React Router · Tailwind CSS · GSAP — 2026 年重写', 'text', 51, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (53, 'footer.origin', 'footer', '页脚建站说明', '建成于 2017 年 4 月凌晨 世纪大道的罗森中。', 'textarea', 52, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (54, 'footer.columnsTitle', 'footer', '页脚栏目标题', '栏目', 'text', 53, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (55, 'footer.nowTitle', 'footer', '页脚此刻标题', '此刻', 'text', 54, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (56, 'footer.mailTitle', 'footer', '页脚写信标题', '写信', 'text', 55, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (57, 'footer.credits', 'footer', '页脚驱动方', '由拂晓智能体-黎明核心驱动', 'text', 56, NOW());
INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES (58, 'footer.running', 'footer', '页脚运行提示', '博客已运行', 'text', 57, NOW());

-- 首页此刻
INSERT INTO now_item (id, label, item_value, note, sort_order) VALUES (1, '在写', 'Node 里的流', '第 47 篇', 0);
INSERT INTO now_item (id, label, item_value, note, sort_order) VALUES (2, '在读', '《夜晚的潜水艇》', '第三遍', 1);
INSERT INTO now_item (id, label, item_value, note, sort_order) VALUES (3, '在拍', '霓虹下的人', '18 张', 2);
INSERT INTO now_item (id, label, item_value, note, sort_order) VALUES (4, '在学', 'CRDT / Rust', 'ossia', 3);

-- 投稿样例
INSERT INTO submission (id, title, author_name, author_email, author_site, category_id, cover, excerpt, content, status, review_note, reviewed_by, submitted_at, reviewed_at, article_id) VALUES (1, '在雨里等一班不会来的车', '阿昼', 'azhou@example.com', 'azhou.ink', 3, NULL, '末班车停运的夜里，我在站台上碰到了三个同样在等的人。', '那天末班车停运，站台的电子屏只显示一行“今日运营结束”。我没有走，因为雨太大了。

## 三个人

第一个是抱着花的男生，花用塑料袋包着；第二个是拎着行李箱的女孩；第三个是我。我们站在同一盏灯下，谁也没说话。

后来男生先走，把花留在了长椅上。女孩看了看那束花，笑了一下，也走了。

## 最后

我把花带回了家，插在矿泉水瓶里。它开了四天。

有时候城市里最温柔的事，是两个陌生人共同保守一个没人说出口的秘密。', 'pending', NULL, NULL, '2026-10-31 22:14:00', NULL, NULL);
INSERT INTO submission (id, title, author_name, author_email, author_site, category_id, cover, excerpt, content, status, review_note, reviewed_by, submitted_at, reviewed_at, article_id) VALUES (2, 'Rust 所有权给我的三次退烧', '陈默', 'chenmo@example.com', 'chenmo.dev', 1, NULL, '借用检查器没有让我变聪明，它只是让我不再自欺欺人。', '我学 Rust 的第一个月，写下的代码比删掉的少。

## 第一次

我以为 clone 是解决办法。三个月后我打开一个热点文件，看见满屏的 to_owned()，像一屋子没有扔的快递箱。

## 第二次

我开始学着把数据的所有权放在离使用最近的地方。函数签名变长了，但调用处变短了。

## 第三次

我不再问“怎么让它编译过”，而是问“这块数据应该活多久”。这个问题在别的语言里也有，只是编译器不逼我回答。

现在我还是会写错，但错得比以前坦白。', 'pending', NULL, NULL, '2026-11-01 09:02:00', NULL, NULL);
INSERT INTO submission (id, title, author_name, author_email, author_site, category_id, cover, excerpt, content, status, review_note, reviewed_by, submitted_at, reviewed_at, article_id) VALUES (3, '读《伐木之夜》：树林里没有答案', '林深见鹿', 'lsjl@example.com', 'lsjl.me', 2, NULL, '一本关于砍树的书，最后讲的是如何与不砍树这件事相处。', '我把这本书带进了山里读，这大概是我今年做过最正确的一个决定。

作者写伐木，其实很少写树倒下的那一刻，他写的是锯子停下来以后，林子里的声音怎么慢慢回来。

> 树林里没有答案，只有回声。

读到最后我明白，这本书不是在讲劳动，是在讲一个人如何在一个不需要他的地方，安静地待着。', 'accepted', '已读过，很好。排在下个月的读书栏目。', '拂晓', '2026-10-28 20:41:00', '2026-11-01 10:00:00', NULL);
INSERT INTO submission (id, title, author_name, author_email, author_site, category_id, cover, excerpt, content, status, review_note, reviewed_by, submitted_at, reviewed_at, article_id) VALUES (4, '关于贵站排版的七条建议', '匿名读者', 'reader@example.com', NULL, 3, NULL, '一封信，关于字距、留白和为什么正文应该更宽一点。', '你好：

我很喜欢这个站，但有七条排版建议想提。第一，正文行长偏短；第二，图片说明的字号可以再小一点；第三……

希望没有冒犯。', 'rejected', '谢谢来信。本站的排版由作者本人固定，不开放修改，也不接受排版类投稿。', '拂晓', '2026-10-27 16:20:00', '2026-11-01 10:00:00', NULL);

-- 媒体库（博客现有图片）
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  1, 'anime-book.jpg', '/media/anime-book.jpg', 'BLOG', 'image/jpeg', 136585, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  2, 'anime-darkroom.jpg', '/media/anime-darkroom.jpg', 'BLOG', 'image/jpeg', 190141, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  3, 'anime-desk.jpg', '/media/anime-desk.jpg', 'BLOG', 'image/jpeg', 189785, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  4, 'anime-screen.jpg', '/media/anime-screen.jpg', 'BLOG', 'image/jpeg', 151772, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  5, 'anime-store.jpg', '/media/anime-store.jpg', 'BLOG', 'image/jpeg', 226781, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  6, 'anime-train.jpg', '/media/anime-train.jpg', 'BLOG', 'image/jpeg', 231851, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  7, 'cover-deploy.jpg', '/media/cover-deploy.jpg', 'BLOG', 'image/jpeg', 316398, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  8, 'cover-film.jpg', '/media/cover-film.jpg', 'BLOG', 'image/jpeg', 192077, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  9, 'cover-lamp.jpg', '/media/cover-lamp.jpg', 'BLOG', 'image/jpeg', 95126, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  10, 'cover-rust.jpg', '/media/cover-rust.jpg', 'BLOG', 'image/jpeg', 139890, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  11, 'cover-stream.jpg', '/media/cover-stream.jpg', 'BLOG', 'image/jpeg', 200106, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  12, 'cover-submarine.jpg', '/media/cover-submarine.jpg', 'BLOG', 'image/jpeg', 109895, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  13, 'cover-terminal.jpg', '/media/cover-terminal.jpg', 'BLOG', 'image/jpeg', 127826, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  14, 'hero-night.jpg', '/media/hero-night.jpg', 'BLOG', 'image/jpeg', 440133, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  15, 'ph-alley.jpg', '/media/ph-alley.jpg', 'BLOG', 'image/jpeg', 142903, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  16, 'ph-bridge.jpg', '/media/ph-bridge.jpg', 'BLOG', 'image/jpeg', 193590, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  17, 'ph-cathedral.jpg', '/media/ph-cathedral.jpg', 'BLOG', 'image/jpeg', 125406, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  18, 'ph-jetty.jpg', '/media/ph-jetty.jpg', 'BLOG', 'image/jpeg', 55749, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  19, 'ph-lightwell.jpg', '/media/ph-lightwell.jpg', 'BLOG', 'image/jpeg', 206753, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  20, 'ph-marker.jpg', '/media/ph-marker.jpg', 'BLOG', 'image/jpeg', 125111, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  21, 'ph-mist.jpg', '/media/ph-mist.jpg', 'BLOG', 'image/jpeg', 136985, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  22, 'ph-rain.jpg', '/media/ph-rain.jpg', 'BLOG', 'image/jpeg', 98965, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  23, 'ph-spiral.jpg', '/media/ph-spiral.jpg', 'BLOG', 'image/jpeg', 86649, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  24, 'ph-treeline.jpg', '/media/ph-treeline.jpg', 'BLOG', 'image/jpeg', 67070, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  25, 'ph-umbrella.jpg', '/media/ph-umbrella.jpg', 'BLOG', 'image/jpeg', 135209, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  26, 'portrait-alt.jpg', '/media/portrait-alt.jpg', 'BLOG', 'image/jpeg', 106163, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  27, 'pt-1005.jpg', '/media/pt-1005.jpg', 'BLOG', 'image/jpeg', 199133, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  28, 'pt-1006.jpg', '/media/pt-1006.jpg', 'BLOG', 'image/jpeg', 266560, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  29, 'pt-1009.jpg', '/media/pt-1009.jpg', 'BLOG', 'image/jpeg', 78386, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  30, 'pt-1011.jpg', '/media/pt-1011.jpg', 'BLOG', 'image/jpeg', 154025, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  31, 'pt-1014.jpg', '/media/pt-1014.jpg', 'BLOG', 'image/jpeg', 93912, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  32, 'pt-177.jpg', '/media/pt-177.jpg', 'BLOG', 'image/jpeg', 301157, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  33, 'pt-22.jpg', '/media/pt-22.jpg', 'BLOG', 'image/jpeg', 416380, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  34, 'pt-334.jpg', '/media/pt-334.jpg', 'BLOG', 'image/jpeg', 109199, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  35, 'pt-349.jpg', '/media/pt-349.jpg', 'BLOG', 'image/jpeg', 80277, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  36, 'pt-375.jpg', '/media/pt-375.jpg', 'BLOG', 'image/jpeg', 120331, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  37, 'pt-447.jpg', '/media/pt-447.jpg', 'BLOG', 'image/jpeg', 174837, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  38, 'pt-473.jpg', '/media/pt-473.jpg', 'BLOG', 'image/jpeg', 129652, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  39, 'pt-497.jpg', '/media/pt-497.jpg', 'BLOG', 'image/jpeg', 35760, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  40, 'pt-550.jpg', '/media/pt-550.jpg', 'BLOG', 'image/jpeg', 76780, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  41, 'pt-660.jpg', '/media/pt-660.jpg', 'BLOG', 'image/jpeg', 115091, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  42, 'pt-669.jpg', '/media/pt-669.jpg', 'BLOG', 'image/jpeg', 224099, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  43, 'pt-685.jpg', '/media/pt-685.jpg', 'BLOG', 'image/jpeg', 207392, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  44, 'pt-726.jpg', '/media/pt-726.jpg', 'BLOG', 'image/jpeg', 214735, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  45, 'pt-768.jpg', '/media/pt-768.jpg', 'BLOG', 'image/jpeg', 335624, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  46, 'pt-821.jpg', '/media/pt-821.jpg', 'BLOG', 'image/jpeg', 137029, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  47, 'pt-832.jpg', '/media/pt-832.jpg', 'BLOG', 'image/jpeg', 116742, NULL, NULL, NOW());
INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (
  48, 'pt-91.jpg', '/media/pt-91.jpg', 'BLOG', 'image/jpeg', 180224, NULL, NULL, NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- 演示数据导入完成：文章 12 篇 / 影集 7 册 / 说说 17 条 / 项目 4 个 / 照片 17 张 / 友链 10 个
-- 后台初始账号由后端启动时自动创建（默认 admin / fuxiao@2026）。
