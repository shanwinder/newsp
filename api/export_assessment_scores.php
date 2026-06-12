<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$context = assessment_teacher_context($conn);
$report = assessment_report_data($conn, $context);
$filename='assessment_'.$context['classroom']['join_code'].'_'.date('Ymd_His').'.csv';
header('Content-Type: text/csv; charset=UTF-8');header('Content-Disposition: attachment; filename="'.$filename.'"');
$out=fopen('php://output','w');fprintf($out,chr(0xEF).chr(0xBB).chr(0xBF));
fputcsv($out,['student_id','name','classroom','join_code','pre_score','post_score','difference','pre_percent','post_percent','lesson1_pre','lesson1_post','lesson2_pre','lesson2_post','lesson3_pre','lesson3_post','lesson4_pre','lesson4_post','game_score','E1_percent','E2_percent']);
foreach($report['students'] as $student){$pre=$student['pre']?intval($student['pre']['score']):'';$post=$student['post']?intval($student['post']['score']):'';$row=[$student['student_id'],$student['name'],$context['classroom']['classroom_name'],$context['classroom']['join_code'],$pre,$post,($pre!==''&&$post!=='')?$post-$pre:'',$pre!==''?$pre/20*100:'',$post!==''?$post/20*100:''];for($i=1;$i<=4;$i++){$row[]=$student['pre']?$student['lessons'][$i]['pre']:'';$row[]=$student['post']?$student['lessons'][$i]['post']:'';}$row[]=$student['game_score'];$row[]=number_format($student['game_score']/36*100,2,'.','');$row[]=$post!==''?number_format($post/20*100,2,'.',''):'';fputcsv($out,$row);}fclose($out);
