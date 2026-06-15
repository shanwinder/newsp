<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$context = survey_teacher_context($conn);
$report = survey_report_data($conn, $context);
$type = in_array($_GET['type'] ?? '', ['individual','category','comments'], true) ? $_GET['type'] : 'individual';
$filename = 'survey_' . $type . '_classroom_' . intval($context['classroom_id']) . '_' . date('Ymd_His') . '.csv';
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="'.$filename.'"');
$output = fopen('php://output','w');
fwrite($output, "\xEF\xBB\xBF");
if ($type === 'category') {
    fputcsv($output,['category','mean','sd','level','respondents']);
    foreach($report['category_stats'] as $row) fputcsv($output,[$row['name'],number_format($row['mean'],2,'.',''),number_format($row['sd'],2,'.',''),$row['level'],$row['respondents']]);
    fputcsv($output,['รวม',number_format($report['summary']['mean'],2,'.',''),number_format($report['summary']['sd'],2,'.',''),$report['summary']['level'],$report['summary']['responded']]);
} elseif ($type === 'comments') {
    $openQuestions = $report['open_questions'];
    fputcsv($output,array_merge(['student_id','name'],array_map(fn($q)=>$q['question_text'],$openQuestions)));
    foreach($report['students'] as $student) { if(!$student['response_id'])continue; $row=[$student['student_id'],$student['name']]; foreach($openQuestions as $q)$row[]=$student['answers'][intval($q['id'])]['text_answer']??''; fputcsv($output,$row); }
} else {
    $ratingQuestions = $report['rating_questions']; $openQuestions = $report['open_questions'];
    $header=['student_id','name']; foreach($ratingQuestions as $q)$header[]='q'.$q['question_no']; $header=array_merge($header,['average','level']); foreach($openQuestions as $i=>$q)$header[]='open_'.($i+1); fputcsv($output,$header);
    foreach($report['students'] as $student) { if(!$student['response_id'])continue; $row=[$student['student_id'],$student['name']]; foreach($ratingQuestions as $q)$row[]=$student['answers'][intval($q['id'])]['rating_value']??''; $row[]=number_format($student['average'],2,'.',''); $row[]=survey_level($student['average']); foreach($openQuestions as $q)$row[]=$student['answers'][intval($q['id'])]['text_answer']??''; fputcsv($output,$row); }
}
fclose($output);
exit();
