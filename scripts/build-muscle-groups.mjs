// Regenerates app/muscle-groups.ts from public/models/atlas.json.
//
// Curated PT muscle groups are defined below as a set of exact, side-stripped
// muscular-system part names (see `normalize`). Matching against exact
// normalized names (rather than loose substrings) avoids false hits between
// anatomically distinct muscles that share a substring, e.g. "spinalis" is
// also a substring of "semispinalis", and "brachialis" of "brachioradialis".
//
// Run with: node scripts/build-muscle-groups.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const atlas = JSON.parse(readFileSync(`${root}public/models/atlas.json`, 'utf8'));
const muscular = atlas.parts.filter(p => p.system === 'muscular');

function normalize(name) {
  return name.toLowerCase().replace(/\b(left|right)\b/g, '').replace(/\s+/g, ' ').trim();
}

// order = display order in the UI. `match` = exact normalized part names that
// belong to this group. An empty `match` means the muscle exists (and gets
// full bilingual content) but has no standalone mesh in this atlas build.
const CONTENT = [
  {
    id: 'chest', order: 1,
    nameVi: 'Ngực', nameEn: 'Chest', anatomicalEn: 'Pectoralis major / minor',
    aliases: ['chest', 'pec', 'pecs', 'pectoral', 'nguc', 'ngực'],
    match: ['abdominal part of pectoralis major', 'clavicular part of pectoralis major', 'sternocostal part of pectoralis major', 'pectoralis minor'],
    functionVi: 'Cơ ngực lớn (pectoralis major) đảm nhiệm động tác khép ngang vai và xoay trong — cơ đẩy chính của thân trên; cơ ngực bé nằm bên dưới hỗ trợ ổn định xương bả vai.',
    functionEn: 'The pectoralis major drives horizontal shoulder adduction and internal rotation — the main pushing muscle of the upper body; pectoralis minor underneath helps stabilize the shoulder blade.',
    exercisesVi: ['Đẩy ngực với tạ đòn/tạ đơn', 'Đẩy ngực trên ghế dốc (incline)', 'Hít đất (push-up)', 'Ép ngực cáp/máy pec-deck'],
    exercisesEn: ['Barbell/dumbbell bench press', 'Incline dumbbell press', 'Push-up', 'Cable/pec-deck fly'],
    tipsVi: ['Giữ hai bả vai kéo xuống và ra sau để bảo vệ khớp vai', 'Kiểm soát pha hạ tạ, tránh bật nảy tạ khỏi ngực', 'Biên độ đầy đủ tốt hơn tăng tạ nhưng tập nửa biên độ'],
    tipsEn: ['Keep shoulder blades pulled back and down to protect the shoulder joint', 'Control the eccentric (lowering) phase instead of bouncing the bar off the chest', 'Full range of motion beats heavier partial reps for hypertrophy'],
  },
  {
    id: 'lats', order: 2,
    nameVi: 'Lưng xô', nameEn: 'Lats', anatomicalEn: 'Latissimus dorsi',
    aliases: ['lats', 'latissimus', 'back width', 'lung xo', 'lưng xô', 'xô'],
    match: [],
    functionVi: 'Cơ lớn nhất vùng lưng; kéo cánh tay xuống và vào thân người, tạo hình chữ V rộng đặc trưng của lưng.',
    functionEn: 'The broadest back muscle; pulls the arm down and toward the body, giving the back its V-taper width.',
    exercisesVi: ['Kéo xà/kéo xô trên máy (lat pulldown)', 'Chèo tạ đòn cúi người (bent-over row)', 'Chèo tạ đơn một tay', 'Kéo cáp tay thẳng (straight-arm pulldown)'],
    exercisesEn: ['Pull-up / lat pulldown', 'Bent-over barbell row', 'One-arm dumbbell row', 'Straight-arm cable pulldown'],
    tipsVi: ['Dẫn động bằng khuỷu tay, không phải bàn tay, để cảm nhận lưng thay vì tay trước', 'Tránh dùng đà/lắc người khi kéo xô hoặc chèo tạ', 'Siết bả vai xuống và ra sau ở cuối động tác kéo'],
    tipsEn: ['Lead with the elbow, not the hand, to feel the back rather than the biceps', 'Avoid using momentum/body swing on pulldowns and rows', 'Squeeze the shoulder blade down and back at the top of the pull'],
    noteVi: 'Cơ lưng xô (latissimus dorsi) chưa có khối 3D riêng trong bộ dữ liệu atlas nguồn nên tạm thời không thể bôi sáng trên mô hình — dùng thẻ nội dung này để tham khảo khi tư vấn khách.',
    noteEn: 'This muscle (latissimus dorsi) is not modeled as a separate mesh in this 3D reference dataset, so it cannot be highlighted on the model yet — use this card for reference during consultations.',
  },
  {
    id: 'traps', order: 3,
    nameVi: 'Cơ thang (áo giáp)', nameEn: 'Traps', anatomicalEn: 'Trapezius',
    aliases: ['traps', 'trapezius', 'co thang', 'cơ thang', 'áo giáp'],
    match: ['ascending part of trapezius', 'descending part of trapezius', 'transverse part of trapezius'],
    functionVi: 'Chạy từ hộp sọ và cột sống tới xương bả vai và xương đòn; nâng, kéo vào trong và xoay xương bả vai — cơ tạo hình dáng "áo giáp" khi nhún vai.',
    functionEn: 'Runs from the skull and spine to the shoulder blade and collarbone; elevates, retracts and rotates the shoulder blade — the muscle behind neck/shoulder shrugs.',
    exercisesVi: ['Nhún vai với tạ đòn/tạ đơn (shrug)', 'Kéo cáp mặt (face pull)', 'Kéo tạ thẳng đứng (upright row)', "Đi bộ mang tạ (farmer's carry)"],
    exercisesEn: ['Barbell/dumbbell shrug', 'Face pull', 'Upright row', "Farmer's carry"],
    tipsVi: ['Nhún vai theo phương thẳng đứng, không xoay tròn, để tránh chèn ép khớp vai', 'Không gồng cổ để "hỗ trợ" — để cơ thang tự thực hiện động tác', 'Bổ sung face pull để cân bằng với cơ thang trên hay bị trội do ngồi bàn giấy'],
    tipsEn: ['Shrug straight up, not in a rolling motion, to avoid shoulder impingement', 'Don’t overuse the neck to "help" — let the traps do the lifting', 'Include face pulls to balance upper-trap dominance from desk posture'],
  },
  {
    id: 'frontDelt', order: 4,
    nameVi: 'Vai trước', nameEn: 'Front delt', anatomicalEn: 'Anterior deltoid',
    aliases: ['front delt', 'anterior deltoid', 'vai truoc', 'vai trước'],
    match: ['clavicular part of deltoid'],
    functionVi: 'Gập khớp vai, nâng cánh tay ra phía trước; hỗ trợ mạnh cho mọi động tác đẩy (đẩy ngực, đẩy vai).',
    functionEn: 'Flexes the shoulder, lifting the arm forward; heavily assists all pressing movements.',
    exercisesVi: ['Đẩy vai qua đầu (overhead press)', 'Nâng tạ trước (front raise)', 'Đẩy ngực trên ghế dốc'],
    exercisesEn: ['Overhead press', 'Front raise', 'Incline bench press'],
    tipsVi: ['Vai trước đã hoạt động nhiều trong buổi tập ngực — tránh tập cô lập quá mức gây quá tải', 'Tránh đánh đà thân người để hất tạ lên'],
    tipsEn: ["Front delts are already worked hard on chest day — don't overtrain with excess isolation", 'Avoid swinging the torso to launch the weight up'],
  },
  {
    id: 'sideDelt', order: 5,
    nameVi: 'Vai giữa', nameEn: 'Side delt', anatomicalEn: 'Lateral deltoid',
    aliases: ['side delt', 'lateral deltoid', 'vai giua', 'vai giữa'],
    match: ['acromial part of deltoid'],
    functionVi: 'Dạng khớp vai, nâng cánh tay sang ngang; cơ chính tạo độ rộng vai.',
    functionEn: 'Abducts the shoulder, lifting the arm out to the side; the main muscle that builds shoulder width.',
    exercisesVi: ['Nâng tạ sang ngang (lateral raise)', 'Nâng cáp sang ngang', 'Nâng vai trên máy'],
    exercisesEn: ['Lateral raise', 'Cable lateral raise', 'Machine lateral raise'],
    tipsVi: ['Dẫn động bằng khuỷu tay, ưu tiên tạ nhẹ và kỹ thuật chuẩn thay vì đánh đà', 'Dừng ngang tầm vai — nâng cao hơn sẽ chuyển tải trọng sang cơ thang'],
    tipsEn: ['Lead with the elbows, use lighter weight and strict form rather than momentum', 'Stop around shoulder height — going higher shifts load onto the traps'],
  },
  {
    id: 'rearDelt', order: 6,
    nameVi: 'Vai sau', nameEn: 'Rear delt', anatomicalEn: 'Posterior deltoid',
    aliases: ['rear delt', 'posterior deltoid', 'vai sau'],
    match: ['spinal part of deltoid'],
    functionVi: 'Duỗi và xoay ngoài khớp vai, kéo cánh tay ra sau; quan trọng cho tư thế và cân bằng vai.',
    functionEn: 'Extends and externally rotates the shoulder, pulling the arm backward; key for posture and shoulder balance.',
    exercisesVi: ['Bay ngược cúi người (reverse fly)', 'Kéo cáp mặt (face pull)', 'Bay ngược trên cáp'],
    exercisesEn: ['Reverse (bent-over) fly', 'Face pull', 'Cable reverse fly'],
    tipsVi: ['Thường là đầu vai yếu và bị bỏ quên nhất — ưu tiên tập nếu khách có tư thế vai khòm về trước', 'Giữ khuỷu tay hơi cong, siết bả vai chứ không chỉ dùng lực tay'],
    tipsEn: ['Often the weakest, most neglected delt head — prioritize it if posture is rounded forward', 'Keep a slight bend in the elbows and squeeze the shoulder blades, not just the arms'],
  },
  {
    id: 'biceps', order: 7,
    nameVi: 'Tay trước (bắp tay trước)', nameEn: 'Biceps', anatomicalEn: 'Biceps brachii & brachialis',
    aliases: ['biceps', 'tay truoc', 'tay trước', 'bap tay truoc'],
    match: ['long head of biceps brachii', 'short head of biceps brachii', 'brachialis'],
    functionVi: 'Gập khớp khuỷu tay và ngửa cẳng tay (xoay lòng bàn tay lên); cơ brachialis nằm bên dưới tăng thêm sức mạnh gập khuỷu và độ dày cánh tay.',
    functionEn: 'Flexes the elbow and supinates the forearm (turns the palm up); brachialis underneath adds raw elbow-flexion strength and arm thickness.',
    exercisesVi: ['Cuốn tay trước với tạ đòn/tạ đơn (curl)', 'Cuốn tay kiểu búa (hammer curl)', 'Cuốn tay trên ghế dốc (incline curl)', 'Cuốn tay trên ghế Scott (preacher curl)'],
    exercisesEn: ['Barbell/dumbbell curl', 'Hammer curl', 'Incline dumbbell curl', 'Preacher curl'],
    tipsVi: ['Giữ khuỷu tay sát thân người — đưa khuỷu ra trước sẽ biến thành động tác vai', 'Kiểm soát pha hạ tạ, không thả rơi tạ'],
    tipsEn: ['Keep elbows pinned to the torso — swinging them forward turns it into a shoulder movement', 'Control the negative instead of dropping the weight'],
  },
  {
    id: 'triceps', order: 8,
    nameVi: 'Tay sau (bắp tay sau)', nameEn: 'Triceps', anatomicalEn: 'Triceps brachii & anconeus',
    aliases: ['triceps', 'tay sau', 'bap tay sau'],
    match: ['lateral head of triceps brachii', 'long head of triceps brachii', 'medial head of triceps brachii', 'anconeus'],
    functionVi: 'Duỗi khớp khuỷu tay, làm thẳng cánh tay; chiếm khoảng hai phần ba kích thước bắp tay trên.',
    functionEn: 'Extends the elbow, straightening the arm; makes up roughly two-thirds of upper-arm size.',
    exercisesVi: ['Đẩy ngực tay hẹp (close-grip bench press)', 'Ép cáp tay sau (pushdown)', 'Duỗi tay sau qua đầu (overhead extension)', 'Xà kép (dip)'],
    exercisesEn: ['Close-grip bench press', 'Triceps pushdown', 'Overhead triceps extension', 'Dip'],
    tipsVi: ['Giữ khuỷu tay cố định và sát người khi ép cáp hoặc duỗi tay', 'Khởi động kỹ khớp khuỷu — đây là vùng dễ bị chấn thương do lặp lại'],
    tipsEn: ['Keep elbows fixed and close to the body during pushdowns and extensions', 'Warm up the elbow joint well — this is a common overuse-injury area'],
  },
  {
    id: 'forearms', order: 9,
    nameVi: 'Cẳng tay', nameEn: 'Forearms', anatomicalEn: 'Forearm flexors/extensors',
    aliases: ['forearm', 'forearms', 'cang tay', 'cẳng tay', 'grip'],
    match: [
      'humeral head of flexor carpi ulnaris', 'ulnar head of flexor carpi ulnaris', 'extensor carpi radialis brevis',
      'extensor carpi radialis longus', 'extensor carpi ulnaris', 'extensor digiti minimi', 'extensor digitorum',
      'extensor indicis', 'extensor pollicis brevis', 'extensor pollicis longus', 'flexor carpi radialis',
      'flexor digitorum profundus', 'flexor digitorum superficialis', 'flexor pollicis longus', 'flexor pollicis brevis',
      'humeral head of pronator teres', 'ulnar head of pronator teres', 'pronator quadratus', 'supinator',
      'palmaris longus', 'brachioradialis', 'abductor pollicis brevis', 'abductor pollicis longus', 'opponens pollicis',
    ],
    functionVi: 'Điều khiển cử động cổ tay, ngón tay và lực nắm; đồng thời ổn định cổ tay trong hầu hết các bài kéo và đẩy.',
    functionEn: 'Controls wrist and finger movement and grip strength; also stabilizes the wrist during nearly every pulling and pressing exercise.',
    exercisesVi: ['Cuốn cổ tay thuận/ngược (wrist curl)', "Đi bộ mang tạ (farmer's carry)", 'Treo xà tĩnh (dead hang)', 'Giữ đĩa tạ bằng lực kẹp ngón (plate pinch)'],
    exercisesEn: ['Wrist curl / reverse wrist curl', "Farmer's carry", 'Dead hang', 'Plate pinch hold'],
    tipsVi: ['Lực nắm thường cải thiện tự nhiên nhờ các bài kéo nặng — tập trực tiếp chỉ là bổ sung, không thay thế', 'Tránh tập khi cổ tay đau; cẳng tay dễ bị quá tải khi tập với tần suất cao'],
    tipsEn: ['Grip strength usually improves naturally from heavy pulling work — direct training is a supplement, not a replacement', 'Avoid training through wrist pain; forearm overuse is common with high training frequency'],
  },
  {
    id: 'abs', order: 10,
    nameVi: 'Bụng (múi bụng)', nameEn: 'Abs', anatomicalEn: 'Rectus abdominis',
    aliases: ['abs', 'six pack', 'bung', 'bụng', 'mui bung', 'múi bụng'],
    match: [],
    functionVi: 'Gập cột sống (kéo lồng ngực về phía khung chậu) và ổn định thân mình; độ nét "múi bụng" phụ thuộc vào tỷ lệ mỡ cơ thể nhiều hơn là chỉ tập bụng.',
    functionEn: 'Flexes the spine (curls the ribcage toward the pelvis) and stabilizes the trunk; visible "six-pack" definition depends more on overall body fat than on ab training alone.',
    exercisesVi: ['Gập bụng (crunch)', 'Nâng chân treo xà (hanging leg raise)', 'Gập bụng cáp (cable crunch)', 'Plank giữ thân'],
    exercisesEn: ['Crunch', 'Hanging leg raise', 'Cable crunch', 'Plank'],
    tipsVi: ['Độ nét múi bụng chủ yếu đến từ dinh dưỡng/tỷ lệ mỡ cơ thể — cần đặt kỳ vọng đúng với khách hàng', 'Thở ra và kéo lồng ngực xuống thay vì chỉ kéo gập cổ'],
    tipsEn: ['Visible definition comes mainly from nutrition/body-fat percentage — set expectations accordingly with clients', 'Exhale and pull the ribcage down rather than just yanking on the neck'],
    noteVi: 'Cơ bụng thẳng (rectus abdominis) chưa có khối 3D riêng trong atlas nguồn (vùng thân chỉ có cơ chéo bụng ngoài) — dùng thẻ nội dung này để tham khảo khi tư vấn khách.',
    noteEn: 'Rectus abdominis is not modeled as a separate mesh in this 3D reference (only the external oblique is present on the trunk) — use this card for reference during consultations.',
  },
  {
    id: 'obliques', order: 11,
    nameVi: 'Bụng xéo (liên sườn)', nameEn: 'Obliques', anatomicalEn: 'External oblique',
    aliases: ['obliques', 'oblique', 'bung xeo', 'bụng xéo'],
    match: ['external oblique'],
    functionVi: 'Xoay và nghiêng thân người, hỗ trợ ép khoang bụng; cơ chéo bụng ngoài là lớp nhìn thấy được, chạy chéo dọc hai bên hông.',
    functionEn: 'Rotates and side-bends the trunk and helps compress the abdomen; the external oblique is the visible layer running diagonally down the sides of the waist.',
    exercisesVi: ['Xoay người kiểu Nga (Russian twist)', 'Plank nghiêng (side plank)', 'Chặt gỗ cáp (woodchopper)', 'Nâng chân treo xà nghiêng bên'],
    exercisesEn: ['Russian twist', 'Side plank', 'Cable woodchopper', 'Hanging oblique raise'],
    tipsVi: ['Nghiêng người với tạ nặng có thể làm eo dày hơn ngoài ý muốn với khách muốn eo thon — ưu tiên các bài xoay/kháng xoay', 'Di chuyển có kiểm soát, tránh giật cột sống khi xoay'],
    tipsEn: ['Heavy weighted side-bends can add unwanted waist thickness for clients chasing a slim look — favor rotation/anti-rotation work instead', 'Move with control; avoid jerking the spine into rotation'],
  },
  {
    id: 'lowerBack', order: 12,
    nameVi: 'Lưng dưới (cơ dựng cột sống)', nameEn: 'Lower back', anatomicalEn: 'Erector spinae',
    aliases: ['lower back', 'erector spinae', 'lung duoi', 'lưng dưới'],
    match: ['iliocostalis cervicis', 'iliocostalis lumborum', 'iliocostalis thoracis', 'longissimus capitis', 'longissimus cervicis', 'longissimus thoracis', 'spinalis thoracis', 'spinalis'],
    functionVi: 'Nhóm cơ chạy dọc cột sống, giúp duỗi lưng và giữ cột sống thẳng — rất quan trọng cho tư thế và cơ chế nâng tạ an toàn.',
    functionEn: 'A column of muscles running along the spine that extends the back and keeps the spine upright — critical for posture and safe lifting mechanics.',
    exercisesVi: ['Deadlift (nâng tạ từ sàn)', 'Duỗi lưng trên ghế hyperextension', 'Good morning (cúi người giữ lưng thẳng)', 'Superman (nằm sấp nâng tay chân)'],
    exercisesEn: ['Deadlift', 'Back extension (hyperextension)', 'Good morning', 'Superman hold'],
    tipsVi: ['Luôn giữ cột sống ở tư thế trung tính — tuyệt đối không để lưng dưới cong tròn khi chịu tải', 'Tăng tải trọng từ từ; đây là vùng dễ chấn thương do quá tải lặp lại', 'Khách có tiền sử đau lưng dưới nên được giới thiệu tới chuyên gia vật lý trị liệu trước khi tập nặng vùng này'],
    tipsEn: ['Always maintain a neutral spine — never round the lower back under load', 'Progress load gradually; this area is a common site of overuse injury', 'Clients with existing lower-back pain should be referred to a physio before loading this area heavily'],
  },
  {
    id: 'glutes', order: 13,
    nameVi: 'Mông', nameEn: 'Glutes', anatomicalEn: 'Gluteus maximus',
    aliases: ['glutes', 'butt', 'mong', 'mông'],
    match: ['gluteus maximus'],
    functionVi: 'Cơ lớn và khỏe nhất cơ thể; duỗi khớp háng — cơ chủ lực trong squat, deadlift và chạy nước rút.',
    functionEn: 'The largest and most powerful muscle in the body; extends the hip — the prime mover in squats, deadlifts and sprinting.',
    exercisesVi: ['Hip thrust (đẩy hông)', 'Squat (ngồi xổm)', 'Romanian deadlift (RDL)', 'Cầu mông (glute bridge)'],
    exercisesEn: ['Hip thrust', 'Squat', 'Romanian deadlift', 'Glute bridge'],
    tipsVi: ['Đẩy lực qua gót chân và siết chặt mông ở đỉnh động tác', 'Tránh ưỡn quá mức lưng dưới để lấy thêm biên độ hông — điều này làm giảm tải lên cơ mông'],
    tipsEn: ['Drive through the heels and squeeze the glutes hard at the top of the movement', 'Avoid hyperextending the lower back to get extra hip range — that shifts load off the glutes'],
  },
  {
    id: 'quads', order: 14,
    nameVi: 'Đùi trước', nameEn: 'Quads', anatomicalEn: 'Quadriceps femoris',
    aliases: ['quads', 'quadriceps', 'dui truoc', 'đùi trước'],
    match: ['rectus femoris', 'vastus intermedius', 'vastus lateralis', 'vastus medialis'],
    functionVi: 'Nhóm bốn cơ mặt trước đùi; duỗi khớp gối — nhóm cơ chính cho sức mạnh squat và bật nhảy.',
    functionEn: 'The four muscles on the front of the thigh; extend the knee — the main muscle group for squatting and jumping power.',
    exercisesVi: ['Squat', 'Đẩy chân trên máy (leg press)', 'Lunge (bước chùng)', 'Duỗi chân trên máy (leg extension)'],
    exercisesEn: ['Squat', 'Leg press', 'Lunge', 'Leg extension'],
    tipsVi: ['Giữ đầu gối thẳng hàng với mũi chân; tránh để gối đổ vào trong', 'Hạ xuống độ sâu mà khách kiểm soát được, không để lưng dưới bị cong tròn'],
    tipsEn: ['Track the knee in line with the toes; avoid letting it collapse inward', 'Descend to a depth the client can control without the lower back rounding'],
  },
  {
    id: 'hamstrings', order: 15,
    nameVi: 'Đùi sau', nameEn: 'Hamstrings', anatomicalEn: 'Biceps femoris, semitendinosus, semimembranosus',
    aliases: ['hamstrings', 'hamstring', 'dui sau', 'đùi sau'],
    match: ['long head of biceps femoris', 'short head of biceps femoris', 'semimembranosus', 'semitendinosus'],
    functionVi: 'Nhóm cơ mặt sau đùi; gập khớp gối và duỗi khớp háng — thường bị căng cứng và dễ chấn thương ở người ngồi nhiều.',
    functionEn: 'The muscles on the back of the thigh; flex the knee and extend the hip — frequently tight and injury-prone in people who sit a lot.',
    exercisesVi: ['Romanian deadlift (RDL)', 'Cuốn chân trên máy (leg curl)', 'Glute-ham raise (GHR)', 'Good morning'],
    exercisesEn: ['Romanian deadlift', 'Leg curl', 'Glute-ham raise', 'Good morning'],
    tipsVi: ['Khởi động kỹ trước các bài gập háng nặng — rách cơ đùi sau rất thường gặp', 'Giữ gối hơi chùng và gập từ khớp háng, không phải từ lưng dưới, khi tập RDL'],
    tipsEn: ['Warm up thoroughly before heavy hip-hinge work — hamstring strains are common', 'Keep a soft knee bend and hinge from the hip, not the lower back, during RDLs'],
  },
  {
    id: 'adductors', order: 16,
    nameVi: 'Đùi trong', nameEn: 'Adductors', anatomicalEn: 'Adductor group, gracilis, pectineus',
    aliases: ['adductors', 'inner thigh', 'dui trong', 'đùi trong'],
    match: ['adductor brevis', 'adductor longus', 'adductor magnus', 'adductor minimus', 'gracilis', 'pectineus'],
    functionVi: 'Nhóm cơ mặt trong đùi; kéo chân vào giữa thân người và giúp ổn định khung chậu khi thực hiện động tác một chân hoặc đổi hướng sang ngang.',
    functionEn: 'The inner-thigh muscles; pull the leg in toward the midline and help stabilize the pelvis during single-leg movement and lateral change of direction.',
    exercisesVi: ['Khép háng trên máy/cáp (hip adduction)', 'Squat kiểu sumo', 'Copenhagen plank (plank khép đùi)', 'Lunge sang ngang (side lunge)'],
    exercisesEn: ['Cable/machine hip adduction', 'Sumo squat', 'Copenhagen plank', 'Side lunge'],
    tipsVi: ['Thường bị bỏ qua trong giáo án thông thường — nên bổ sung cho khách chơi thể thao sân bãi để giảm nguy cơ căng cơ háng', 'Tăng biên độ từ từ; vùng háng rất dễ bị căng khi cơ chưa nóng'],
    tipsEn: ['Often overlooked in standard programs — worth including for field/court-sport clients to reduce groin-strain risk', 'Progress range of motion gradually; the groin strains easily when cold'],
  },
  {
    id: 'hipAbductors', order: 17,
    nameVi: 'Đùi ngoài / hông', nameEn: 'Abductors / Hip', anatomicalEn: 'Gluteus medius/minimus & deep hip rotators',
    aliases: ['abductors', 'hip', 'dui ngoai', 'đùi ngoài', 'hong', 'hông'],
    match: ['gluteus medius', 'gluteus minimus', 'piriformis', 'obturator externus', 'obturator internus', 'gemellus inferior', 'gemellus superior', 'quadratus femoris'],
    functionVi: 'Cơ mông nhỡ/mông bé và các cơ xoay sâu ở mặt ngoài hông; ổn định khung chậu khi đứng một chân và kiểm soát trục gối khi đi, chạy, squat.',
    functionEn: 'The gluteus medius/minimus and deep hip rotators on the outer hip; stabilize the pelvis when standing on one leg and control knee alignment while walking, running and squatting.',
    exercisesVi: ['Nâng chân sang ngang nằm nghiêng (hip abduction)', 'Đi ngang với dây kháng lực (band lateral walk)', 'Clamshell (mở gối kiểu vỏ sò)', 'Cầu mông một chân'],
    exercisesEn: ['Side-lying hip abduction', 'Band lateral walk (monster walk)', 'Clamshell', 'Single-leg glute bridge'],
    tipsVi: ['Ở nhóm cơ này, tải nhẹ và kiểm soát tốt quan trọng hơn tạ nặng', 'Cơ dạng hông yếu là nguyên nhân phổ biến khiến gối đổ vào trong khi squat — nên tầm soát nhóm này'],
    tipsEn: ['Small loads and high control matter more here than heavy weight', 'A weak hip abductor is a common cause of knees caving inward during squats — worth screening for'],
  },
  {
    id: 'calves', order: 18,
    nameVi: 'Bắp chân (bắp chuối)', nameEn: 'Calves', anatomicalEn: 'Gastrocnemius, soleus',
    aliases: ['calves', 'calf', 'bap chan', 'bắp chân', 'bap chuoi', 'bắp chuối'],
    match: ['lateral head of gastrocnemius', 'medial head of gastrocnemius', 'soleus', 'plantaris'],
    functionVi: 'Cơ bụng chân (gastrocnemius) và cơ dép (soleus) ở mặt sau cẳng chân; gập lòng bàn chân (đẩy bàn chân xuống) — tạo lực cho đi, chạy, bật nhảy.',
    functionEn: 'The gastrocnemius and soleus on the back of the lower leg; plantarflex the ankle (push the foot down) — power for walking, running and jumping.',
    exercisesVi: ['Nhón gót đứng (standing calf raise)', 'Nhón gót ngồi (seated calf raise)', 'Nhảy dây', 'Nhón gót một chân'],
    exercisesEn: ['Standing calf raise', 'Seated calf raise', 'Jump rope', 'Single-leg calf raise'],
    tipsVi: ['Tập với biên độ đầy đủ — kéo giãn hết cỡ ở đáy và nhón cao hết cỡ ở đỉnh', 'Bắp chân thường đáp ứng tốt nhất với mức lặp cao và tần suất tập thường xuyên'],
    tipsEn: ['Use a full range of motion — stretch fully at the bottom and rise onto the toes at the top', 'Calves generally respond best to higher rep ranges and frequent training'],
  },
  {
    id: 'neck', order: 19,
    nameVi: 'Cổ', nameEn: 'Neck', anatomicalEn: 'Sternocleidomastoid, splenius',
    aliases: ['neck', 'co', 'cổ'],
    match: ['sternocleidomastoid', 'splenius capitis', 'splenius cervicis'],
    functionVi: 'Cơ ức đòn chũm (SCM) xoay và gập đầu; các cơ cổ sau duỗi đầu và nâng đỡ tư thế thẳng — quan trọng với vận động viên thể thao đối kháng và khách bị tư thế đầu chúi trước.',
    functionEn: 'The sternocleidomastoid rotates and flexes the head; the posterior neck muscles extend the head and support upright posture — relevant for contact-sport athletes and clients with forward-head posture.',
    exercisesVi: ['Gập/duỗi cổ với kháng lực tay hoặc dây thun', 'Nâng tạ với đai đầu (neck harness)', 'Giữ tĩnh lực cổ (isometric hold)'],
    exercisesEn: ['Neck flexion/extension with manual or band resistance', 'Neck harness plate raise', 'Isometric neck hold'],
    tipsVi: ['Tăng tải rất từ từ với kháng lực nhẹ — cột sống cổ có biên độ an toàn thấp', 'Không khuyến khích tập cho khách có bệnh lý cổ/cột sống cổ nếu chưa có chỉ định của bác sĩ'],
    tipsEn: ['Progress very gradually with light resistance — the cervical spine has a low margin for error', 'Not recommended for clients with existing neck or cervical-spine conditions without medical clearance'],
  },
  {
    id: 'rotatorCuff', order: 20,
    nameVi: 'Chóp xoay vai (bổ trợ)', nameEn: 'Rotator cuff', anatomicalEn: 'Supraspinatus, infraspinatus, teres minor',
    aliases: ['rotator cuff', 'chop xoay vai', 'chóp xoay vai'],
    match: ['supraspinatus', 'infraspinatus muscle', 'teres minor'],
    functionVi: 'Nhóm cơ sâu quanh khớp vai (ở đây gồm supraspinatus, infraspinatus và teres minor) giữ chỏm xương cánh tay nằm đúng vị trí trong ổ khớp vai — nhỏ nhưng cực kỳ quan trọng cho sức khỏe khớp vai, không phải để tăng kích thước.',
    functionEn: 'Deep muscles around the shoulder (supraspinatus, infraspinatus and teres minor are modeled here) that hold the arm bone centered in the shoulder socket — small but critical for shoulder health, not size.',
    exercisesVi: ['Xoay ngoài vai với dây thun', 'Xoay trong vai với dây thun', 'Nằm sấp nâng tay hình Y-T-W', 'Xoay ngoài vai với tạ đơn nhẹ'],
    exercisesEn: ['Band external rotation', 'Band internal rotation', 'Prone Y-T-W raise', 'Light dumbbell external rotation'],
    tipsVi: ['Luôn dùng tạ nhẹ và kỹ thuật chuẩn — đây là nhóm bài phòng ngừa chấn thương, không phải để tăng khối lượng cơ', 'Ưu tiên cho khách tập nhiều động tác đẩy qua đầu hoặc ném'],
    tipsEn: ['Always use light weight and strict form — this is a prehab/injury-prevention group, not a mass-building one', 'Prioritize for clients who do a lot of overhead pressing or throwing'],
  },
  {
    id: 'midBack', order: 21,
    nameVi: 'Lưng giữa (trám & răng cưa)', nameEn: 'Mid-back', anatomicalEn: 'Rhomboids & serratus anterior',
    aliases: ['mid back', 'rhomboid', 'serratus', 'lung giua', 'lưng giữa'],
    match: ['rhomboid major', 'rhomboid minor', 'serratus anterior'],
    functionVi: 'Cơ trám kéo hai xương bả vai lại gần nhau (retraction); cơ răng cưa trước đẩy bả vai ra trước và xoay lên trên — cùng nhau kiểm soát vị trí xương bả vai và tư thế.',
    functionEn: 'The rhomboids retract the shoulder blades (squeeze them together); serratus anterior protracts and rotates them upward — together they control shoulder-blade position and posture.',
    exercisesVi: ['Chèo cáp ngồi (seated row)', 'Kéo dây thun sang ngang (band pull-apart)', 'Hít đất kiểu xương bả vai (scapular push-up)', 'Bay ngược (reverse fly)'],
    exercisesEn: ['Seated cable row', 'Band pull-apart', 'Scapular push-up', 'Reverse fly'],
    tipsVi: ['Lưng giữa khỏe và cân bằng là một trong những cách khắc phục tốt nhất cho tư thế vai khòm do ngồi bàn giấy', 'Siết và giữ ngắn ở đỉnh co cơ thay vì thực hiện động tác quá nhanh'],
    tipsEn: ['A strong, well-balanced mid-back is one of the best fixes for rounded-shoulder posture from desk work', 'Squeeze and hold briefly at peak contraction rather than rushing the rep'],
  },
  {
    id: 'hipFlexors', order: 22,
    nameVi: 'Gập hông (cơ thắt lưng chậu)', nameEn: 'Hip flexors', anatomicalEn: 'Psoas major & iliacus',
    aliases: ['hip flexors', 'psoas', 'iliacus', 'gap hong', 'gập hông'],
    match: ['psoas major', 'iliacus'],
    functionVi: 'Cơ thắt lưng lớn (psoas major) và cơ chậu (iliacus) gập khớp háng, nâng đầu gối về phía ngực; thường bị căng cứng và co rút ngắn ở người ngồi nhiều giờ.',
    functionEn: 'The psoas major and iliacus flex the hip, lifting the knee toward the chest; frequently tight and shortened in people who sit for long hours.',
    exercisesVi: ['Nâng chân treo xà/nằm (leg raise)', 'Gập háng trên cáp (cable hip flexion)', 'Bước nâng gối tại chỗ (marching drill)', 'Giãn cơ gập háng tư thế quỳ (kneeling stretch)'],
    exercisesEn: ['Hanging/lying leg raise', 'Cable hip flexion', 'Marching hip flexor drill', 'Kneeling hip flexor stretch'],
    tipsVi: ['Kết hợp tập mạnh cơ với giãn cơ thường xuyên — tình trạng căng cứng ở đây liên quan tới khó chịu vùng lưng dưới', 'Đặc biệt nên chú ý với khách làm việc văn phòng hoặc ngồi lâu khi di chuyển'],
    tipsEn: ['Pair strengthening with regular stretching — tightness here is linked to lower-back discomfort', 'Especially useful to address for clients with desk jobs or long commutes sitting down'],
  },
];

const partsByNormalized = new Map();
for (const p of muscular) {
  const n = normalize(p.name);
  if (!partsByNormalized.has(n)) partsByNormalized.set(n, []);
  partsByNormalized.get(n).push(p);
}

const claimed = new Set();
let issues = 0;
const idsByGroup = {};
for (const c of CONTENT) {
  const ids = [];
  for (const target of c.match) {
    const matches = partsByNormalized.get(target);
    if (!matches || matches.length === 0) {
      console.error(`[MISS] group=${c.id} target="${target}" matched nothing`);
      issues++;
      continue;
    }
    for (const m of matches) {
      if (claimed.has(m.id)) {
        console.error(`[DUPLICATE] part ${m.id} (${m.name}) claimed twice, now also by ${c.id}`);
        issues++;
      }
      claimed.add(m.id);
      ids.push(m.id);
    }
  }
  idsByGroup[c.id] = ids.sort();
}
if (issues > 0) {
  console.error(`\n${issues} issue(s) found — aborting without writing output.`);
  process.exit(1);
}
console.log(`Matched ${claimed.size}/${muscular.length} muscular parts across ${CONTENT.length} groups (no misses, no duplicate claims).`);

function esc(s) { return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function strArr(arr) { return `[${arr.map(s => `'${esc(s)}'`).join(', ')}]`; }

let out = `// GENERATED FILE — do not hand-edit. Run \`node scripts/build-muscle-groups.mjs\` to regenerate.\n`;
out += `// Curated bilingual (EN/VI) PT content for Phase 1, mapped to verified atlas.json Part ids.\n`;
out += `import type {SystemId} from './anatomy';\n\n`;
out += `export interface MuscleGroup {\n id:string;\n order:number;\n nameVi:string;\n nameEn:string;\n anatomicalEn:string;\n aliases:string[];\n system:SystemId;\n partIds:string[];\n functionVi:string;\n functionEn:string;\n exercisesVi:string[];\n exercisesEn:string[];\n tipsVi:string[];\n tipsEn:string[];\n noteVi?:string;\n noteEn?:string;\n}\n\n`;
out += `export const MUSCLE_GROUPS: MuscleGroup[] = [\n`;
for (const c of CONTENT) {
  out += ` {\n`;
  out += `  id:'${c.id}',order:${c.order},\n`;
  out += `  nameVi:'${esc(c.nameVi)}',nameEn:'${esc(c.nameEn)}',anatomicalEn:'${esc(c.anatomicalEn)}',\n`;
  out += `  aliases:${strArr(c.aliases)},\n`;
  out += `  system:'muscular',\n`;
  out += `  partIds:${strArr(idsByGroup[c.id])},\n`;
  out += `  functionVi:'${esc(c.functionVi)}',\n`;
  out += `  functionEn:'${esc(c.functionEn)}',\n`;
  out += `  exercisesVi:${strArr(c.exercisesVi)},\n`;
  out += `  exercisesEn:${strArr(c.exercisesEn)},\n`;
  out += `  tipsVi:${strArr(c.tipsVi)},\n`;
  out += `  tipsEn:${strArr(c.tipsEn)},\n`;
  if (c.noteVi) out += `  noteVi:'${esc(c.noteVi)}',\n`;
  if (c.noteEn) out += `  noteEn:'${esc(c.noteEn)}',\n`;
  out += ` },\n`;
}
out += `];\n\n`;
out += `export const MUSCLE_GROUP_BY_PART = new Map<string, MuscleGroup>();\n`;
out += `for (const g of MUSCLE_GROUPS) for (const id of g.partIds) MUSCLE_GROUP_BY_PART.set(id, g);\n`;

writeFileSync(`${root}app/muscle-groups.ts`, out);
console.log(`Wrote app/muscle-groups.ts (${out.length} bytes, ${CONTENT.length} groups).`);
