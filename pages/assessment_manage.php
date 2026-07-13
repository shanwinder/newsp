<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$context = assessment_teacher_context($conn);
$notice = '';
$error = '';

function can_manage_assessment(array $assessment): bool
{
    return is_super_admin() || intval($assessment['created_by'] ?? 0) === intval($_SESSION['user_id'] ?? 0);
}

function require_manageable_assessment(mysqli $conn, int $assessmentId): array
{
    $stmt = $conn->prepare("SELECT * FROM assessments WHERE id=? LIMIT 1");
    $stmt->bind_param('i', $assessmentId);
    $stmt->execute();
    $assessment = $stmt->get_result()->fetch_assoc();
    if (!$assessment || !can_manage_assessment($assessment)) {
        throw new RuntimeException('ชุดข้อสอบกลางหรือชุดของครูท่านอื่นอ่านได้อย่างเดียว กรุณาสร้างเวอร์ชันใหม่ก่อนแก้ไข');
    }
    return $assessment;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!assessment_verify_csrf($_POST['csrf_token'] ?? null)) { http_response_code(419); exit('คำขอหมดอายุ'); }
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'create') {
            $type = ($_POST['assessment_type'] ?? '') === 'posttest' ? 'posttest' : 'pretest';
            $title = trim($_POST['title'] ?? '');
            if ($title === '') throw new RuntimeException('กรุณาระบุชื่อชุดข้อสอบ');
            $version = trim($_POST['version_label'] ?? 'ชุดใหม่');
            $creator = intval($_SESSION['user_id']);
            $stmt = $conn->prepare("INSERT INTO assessments (assessment_type,title,description,total_questions,full_score,time_limit_minutes,status,version_label,created_by) VALUES (?,?,?,20,20,30,'draft',?,?)");
            $description = trim($_POST['description'] ?? '');
            $stmt->bind_param('ssssi', $type,$title,$description,$version,$creator); $stmt->execute();
            $notice = 'สร้างชุดข้อสอบใหม่แล้ว';
        } elseif ($action === 'clone') {
            $sourceId = intval($_POST['assessment_id'] ?? 0);
            $conn->begin_transaction();
            $sourceStmt = $conn->prepare("SELECT * FROM assessments WHERE id=?"); $sourceStmt->bind_param('i',$sourceId); $sourceStmt->execute(); $source=$sourceStmt->get_result()->fetch_assoc();
            if (!$source) throw new RuntimeException('ไม่พบชุดข้อสอบต้นฉบับ');
            $creator=intval($_SESSION['user_id']); $title=$source['title'].' - สำเนา '.date('d/m/Y'); $version='ปรับปรุง '.date('Ymd-His');
            $insert=$conn->prepare("INSERT INTO assessments (assessment_type,title,description,total_questions,full_score,time_limit_minutes,status,version_label,created_by) VALUES (?,?,?,?,?,?,'draft',?,?)");
            $insert->bind_param('sssiiisi',$source['assessment_type'],$title,$source['description'],$source['total_questions'],$source['full_score'],$source['time_limit_minutes'],$version,$creator); $insert->execute(); $newId=$conn->insert_id;
            $copy=$conn->prepare("INSERT INTO assessment_questions (assessment_id,game_id,question_no,cognitive_level,question_text,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation,status) SELECT ?,game_id,question_no,cognitive_level,question_text,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation,status FROM assessment_questions WHERE assessment_id=?"); $copy->bind_param('ii',$newId,$sourceId); $copy->execute();
            $conn->commit(); $notice='สร้างเวอร์ชันใหม่พร้อมคัดลอกข้อสอบแล้ว';
        } elseif ($action === 'status') {
            $id=intval($_POST['assessment_id']??0); $status=in_array($_POST['status']??'', ['draft','active','archived'],true)?$_POST['status']:'draft';
            require_manageable_assessment($conn, $id);
            $stmt=$conn->prepare("UPDATE assessments SET status=? WHERE id=?"); $stmt->bind_param('si',$status,$id); $stmt->execute(); $notice='อัปเดตสถานะแล้ว';
        } elseif ($action === 'save_question') {
            $questionId=intval($_POST['question_id']??0); $assessmentId=intval($_POST['assessment_id']??0);
            require_manageable_assessment($conn, $assessmentId);
            $used=$conn->prepare("SELECT COUNT(*) AS total FROM assessment_attempts WHERE assessment_id=?"); $used->bind_param('i',$assessmentId); $used->execute();
            if (intval($used->get_result()->fetch_assoc()['total'])>0) throw new RuntimeException('ชุดนี้มีผู้เข้าสอบแล้ว กรุณาสร้างเวอร์ชันใหม่ก่อนแก้ข้อสอบ');
            $gameId=max(1,min(4,intval($_POST['game_id']??1))); $questionNo=intval($_POST['question_no']??0); $level=$_POST['cognitive_level']??'apply';
            if (!in_array($level,['remember','understand','apply','analyze'],true)) $level='apply'; $correct=$_POST['correct_choice']??'A'; if(!in_array($correct,['A','B','C','D'],true))$correct='A';
            $values=[trim($_POST['question_text']??''),trim($_POST['choice_a']??''),trim($_POST['choice_b']??''),trim($_POST['choice_c']??''),trim($_POST['choice_d']??''),trim($_POST['explanation']??'')];
            if ($questionNo<1 || in_array('',array_slice($values,0,5),true)) throw new RuntimeException('กรุณากรอกเลขข้อ คำถาม และตัวเลือกให้ครบ');
            if($questionId>0){$stmt=$conn->prepare("UPDATE assessment_questions SET game_id=?,question_no=?,cognitive_level=?,question_text=?,choice_a=?,choice_b=?,choice_c=?,choice_d=?,correct_choice=?,explanation=? WHERE id=? AND assessment_id=?");$stmt->bind_param('iissssssssii',$gameId,$questionNo,$level,$values[0],$values[1],$values[2],$values[3],$values[4],$correct,$values[5],$questionId,$assessmentId);}
            else{$stmt=$conn->prepare("INSERT INTO assessment_questions (assessment_id,game_id,question_no,cognitive_level,question_text,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation) VALUES (?,?,?,?,?,?,?,?,?,?,?)");$stmt->bind_param('iiissssssss',$assessmentId,$gameId,$questionNo,$level,$values[0],$values[1],$values[2],$values[3],$values[4],$correct,$values[5]);}
            $stmt->execute(); $notice='บันทึกข้อสอบแล้ว';
        }
    } catch(Throwable $e) { if($conn->errno===0 && $action==='clone') $conn->rollback(); $error=$e->getMessage(); }
}

$selectedId=intval($_GET['assessment_id']??0); $selected=null; $questions=[];
if($selectedId){$stmt=$conn->prepare("SELECT a.*,(SELECT COUNT(*) FROM assessment_attempts aa WHERE aa.assessment_id=a.id) attempt_count FROM assessments a WHERE a.id=?");$stmt->bind_param('i',$selectedId);$stmt->execute();$selected=$stmt->get_result()->fetch_assoc();if($selected){$q=$conn->prepare("SELECT * FROM assessment_questions WHERE assessment_id=? ORDER BY question_no");$q->bind_param('i',$selectedId);$q->execute();$questions=$q->get_result()->fetch_all(MYSQLI_ASSOC);}}
if ($selected && !is_super_admin() && $selected['created_by'] !== null && intval($selected['created_by']) !== intval($_SESSION['user_id'])) {
    $selected = null;
    $questions = [];
    $error = 'ไม่มีสิทธิ์ดูชุดข้อสอบของครูท่านอื่น';
}
$canEditSelected = $selected ? can_manage_assessment($selected) : false;
$editQuestion=null;$editId=intval($_GET['question_id']??0);if($editId&&$selected){foreach($questions as $q){if(intval($q['id'])===$editId)$editQuestion=$q;}}
if (is_super_admin()) {
    $listStmt = $conn->prepare("SELECT a.*,(SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id=a.id AND q.status='active') question_count,(SELECT COUNT(*) FROM assessment_attempts aa WHERE aa.assessment_id=a.id) attempt_count FROM assessments a ORDER BY a.id DESC");
} else {
    $listStmt = $conn->prepare("SELECT a.*,(SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id=a.id AND q.status='active') question_count,(SELECT COUNT(*) FROM assessment_attempts aa WHERE aa.assessment_id=a.id) attempt_count FROM assessments a WHERE a.created_by IS NULL OR a.created_by=? ORDER BY a.id DESC");
    $listStmt->bind_param('i', $_SESSION['user_id']);
}
$listStmt->execute();
$list=$listStmt->get_result()->fetch_all(MYSQLI_ASSOC);
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>จัดการข้อสอบ</title><?php
$page_styles = array (
  0 => 'pages/assessment_manage.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head><body class="app-page assessment-manage-page">
<nav class="navbar navbar-dark bg-primary"><div class="container"><span class="navbar-brand fw-bold"><i class="bi bi-journal-check"></i> คลังข้อสอบ</span><a class="btn btn-light btn-sm rounded-pill" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>">กลับ Dashboard</a></div></nav><main class="container py-4">
<?php if($notice):?><div class="alert alert-success"><?php echo htmlspecialchars($notice);?></div><?php endif;if($error):?><div class="alert alert-danger"><?php echo htmlspecialchars($error);?></div><?php endif;?>
<div class="card shadow-sm mb-4"><div class="card-body"><h5 class="fw-bold">สร้างชุดข้อสอบใหม่</h5><form method="post" class="row g-2"><input type="hidden" name="csrf_token" value="<?php echo assessment_csrf_token();?>"><input type="hidden" name="action" value="create"><div class="col-md-2"><select name="assessment_type" class="form-select"><option value="pretest">ก่อนเรียน</option><option value="posttest">หลังเรียน</option></select></div><div class="col-md-4"><input name="title" class="form-control" placeholder="ชื่อชุดข้อสอบ" required></div><div class="col-md-2"><input name="version_label" class="form-control" placeholder="เวอร์ชัน"></div><div class="col-md-3"><input name="description" class="form-control" placeholder="คำอธิบาย"></div><div class="col-md-1"><button class="btn btn-success w-100">สร้าง</button></div></form></div></div>
<div class="card shadow-sm mb-4"><div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>ชุดข้อสอบ</th><th>ประเภท</th><th>ข้อ</th><th>ผู้สอบ</th><th>สถานะ</th><th></th></tr></thead><tbody><?php foreach($list as $a):?><tr><td><strong><?php echo htmlspecialchars($a['title']);?></strong><br><small class="text-muted"><?php echo htmlspecialchars($a['version_label']);?></small></td><td><?php echo assessment_type_label($a['assessment_type']);?></td><td><?php echo intval($a['question_count']);?></td><td><?php echo intval($a['attempt_count']);?></td><td><span class="badge bg-<?php echo $a['status']==='active'?'success':($a['status']==='archived'?'secondary':'warning');?>"><?php echo $a['status'];?></span></td><td class="text-nowrap"><a class="btn btn-outline-primary btn-sm" href="?assessment_id=<?php echo $a['id'];?>">รายละเอียด</a><form method="post" class="d-inline"><input type="hidden" name="csrf_token" value="<?php echo assessment_csrf_token();?>"><input type="hidden" name="action" value="clone"><input type="hidden" name="assessment_id" value="<?php echo $a['id'];?>"><button class="btn btn-outline-secondary btn-sm">สร้างเวอร์ชันใหม่</button></form><form method="post" class="d-inline"><input type="hidden" name="csrf_token" value="<?php echo assessment_csrf_token();?>"><input type="hidden" name="action" value="status"><input type="hidden" name="assessment_id" value="<?php echo $a['id'];?>"><input type="hidden" name="status" value="<?php echo $a['status']==='active'?'archived':'active';?>"><button class="btn btn-outline-<?php echo $a['status']==='active'?'danger':'success';?> btn-sm"><?php echo $a['status']==='active'?'เก็บถาวร':'เปิดใช้งาน';?></button></form></td></tr><?php endforeach;?></tbody></table></div></div>
<?php if($selected):?><div class="row g-4"><div class="col-lg-7"><div class="card shadow-sm"><div class="card-body"><h4 class="fw-bold"><?php echo htmlspecialchars($selected['title']);?></h4><?php if($selected['attempt_count']>0):?><div class="alert alert-warning">ชุดนี้มีผู้สอบแล้ว จึงล็อกการแก้ไข กรุณาสร้างเวอร์ชันใหม่</div><?php endif;?><div class="list-group"><?php foreach($questions as $q):?><a class="list-group-item list-group-item-action" href="?assessment_id=<?php echo $selectedId;?>&question_id=<?php echo $q['id'];?>"><strong>ข้อ <?php echo $q['question_no'];?></strong> <?php echo htmlspecialchars($q['question_text']);?><span class="badge bg-light text-dark float-end">บท <?php echo $q['game_id'];?></span></a><?php endforeach;?></div></div></div></div>
<div class="col-lg-5"><form method="post" class="card shadow-sm"><div class="card-body"><h5 class="fw-bold"><?php echo $editQuestion?'แก้ไขข้อสอบ':'เพิ่มข้อสอบ';?></h5><input type="hidden" name="csrf_token" value="<?php echo assessment_csrf_token();?>"><input type="hidden" name="action" value="save_question"><input type="hidden" name="assessment_id" value="<?php echo $selectedId;?>"><input type="hidden" name="question_id" value="<?php echo intval($editQuestion['id']??0);?>"><div class="row g-2 mb-2"><div class="col"><label>เลขข้อ</label><input type="number" min="1" name="question_no" class="form-control" value="<?php echo htmlspecialchars($editQuestion['question_no']??count($questions)+1);?>"></div><div class="col"><label>บทเรียน</label><select name="game_id" class="form-select"><?php for($i=1;$i<=4;$i++):?><option value="<?php echo $i;?>" <?php echo intval($editQuestion['game_id']??1)===$i?'selected':'';?>>บท <?php echo $i;?></option><?php endfor;?></select></div><div class="col"><label>ระดับ</label><select name="cognitive_level" class="form-select"><?php foreach(['remember'=>'จำ','understand'=>'เข้าใจ','apply'=>'นำไปใช้','analyze'=>'วิเคราะห์'] as $v=>$l):?><option value="<?php echo $v;?>" <?php echo ($editQuestion['cognitive_level']??'apply')===$v?'selected':'';?>><?php echo $l;?></option><?php endforeach;?></select></div></div><textarea name="question_text" class="form-control mb-2" rows="3" placeholder="คำถาม" required><?php echo htmlspecialchars($editQuestion['question_text']??'');?></textarea><?php foreach(['a'=>'ก','b'=>'ข','c'=>'ค','d'=>'ง'] as $v=>$l):?><div class="input-group mb-2"><span class="input-group-text"><?php echo $l;?></span><input name="choice_<?php echo $v;?>" class="form-control" value="<?php echo htmlspecialchars($editQuestion['choice_'.$v]??'');?>" required></div><?php endforeach;?><label>เฉลย</label><select name="correct_choice" class="form-select mb-2"><?php foreach(['A'=>'ก','B'=>'ข','C'=>'ค','D'=>'ง'] as $v=>$l):?><option value="<?php echo $v;?>" <?php echo ($editQuestion['correct_choice']??'A')===$v?'selected':'';?>><?php echo $l;?></option><?php endforeach;?></select><textarea name="explanation" class="form-control mb-3" placeholder="คำอธิบายสำหรับครู"><?php echo htmlspecialchars($editQuestion['explanation']??'');?></textarea><button class="btn btn-primary w-100" <?php echo (!$canEditSelected || $selected['attempt_count']>0)?'disabled':'';?>>บันทึกข้อสอบ</button></div></form></div></div><?php endif;?></main></body></html>
