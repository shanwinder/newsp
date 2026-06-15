<?php
// pages/manual_teacher.php
session_start();
require_once '../includes/db.php';
require_once '../includes/auth.php';
$app = require __DIR__ . '/../config/app.php';

// ตรวจสอบสิทธิ์ครูหรือแอดมิน
require_teacher_or_admin();
?>
<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>คู่มือการใช้งานสำหรับครูผู้สอน | <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta
      name="description"
      content="คู่มือการใช้งานระบบเกมแบบฝึกทักษะออนไลน์สำหรับครูผู้สอน"
    />
    <style>
      :root {
        --leaf: #1f7a3a;
        --leaf2: #2f9e55;
        --mint: #e9f8df;
        --cream: #fff9e8;
        --dark: #14331f;
        --soil: #7a4b22;
        --gold: #ffc857;
        --paper: #fff;
        --muted: #5d705f;
        --line: rgba(31, 122, 58, 0.18);
        --shadow: 0 22px 70px rgba(20, 51, 31, 0.16);
        --r: 28px;
      }
      * {
        box-sizing: border-box;
      }
      html {
        scroll-behavior: smooth;
      }
      body {
        margin: 0;
        font-family:
          "TH Sarabun New", "Sarabun", "Noto Sans Thai", Tahoma, sans-serif;
        color: var(--dark);
        background:
          radial-gradient(
            circle at 8% 4%,
            rgba(255, 200, 87, 0.35),
            transparent 24rem
          ),
          radial-gradient(
            circle at 92% 8%,
            rgba(47, 158, 85, 0.18),
            transparent 28rem
          ),
          linear-gradient(180deg, #f5ffe9 0%, #fffdf4 38%, #f7fff2 100%);
        line-height: 1.75;
      }
      body:before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.45;
        z-index: -1;
        background-image:
          linear-gradient(90deg, rgba(31, 122, 58, 0.055) 1px, transparent 1px),
          linear-gradient(0deg, rgba(31, 122, 58, 0.045) 1px, transparent 1px);
        background-size: 38px 38px;
      }
      .page {
        width: min(1180px, calc(100% - 36px));
        margin: 0 auto;
      }
      .hero {
        position: relative;
        overflow: hidden;
        margin: 22px auto 26px;
        min-height: 520px;
        border-radius: 38px;
        color: #fff;
        box-shadow: var(--shadow);
        background:
          linear-gradient(
            135deg,
            rgba(20, 51, 31, 0.94),
            rgba(31, 122, 58, 0.82)
          ),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Cpath d='M0 530 C180 470 260 600 440 530 C600 470 760 610 940 520 C1080 450 1150 500 1200 470 L1200 700 L0 700 Z' fill='%23f0c36b' opacity='.33'/%3E%3Cpath d='M0 590 C230 520 350 650 560 570 C780 480 910 620 1200 520 L1200 700 L0 700 Z' fill='%23fff8df' opacity='.42'/%3E%3C/svg%3E");
        background-size: cover;
      }
      .hero:after {
        content: "🌾";
        position: absolute;
        right: -8px;
        bottom: -70px;
        font-size: 240px;
        opacity: 0.2;
        transform: rotate(-14deg);
      }
      .hero-inner {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 34px;
        align-items: center;
        padding: 58px;
        position: relative;
        z-index: 1;
      }
      .eyebrow {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.13);
        font-weight: 800;
      }
      h1 {
        margin: 22px 0 12px;
        font-size: clamp(2.2rem, 4vw, 4.6rem);
        line-height: 1.08;
        letter-spacing: -0.03em;
      }
      .hero p {
        font-size: 1.2rem;
        max-width: 760px;
        color: rgba(255, 255, 255, 0.92);
        margin: 0 0 26px;
      }
      .btns {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 24px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 48px;
        padding: 12px 20px;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 900;
        transition: 0.2s;
      }
      .btn-primary {
        background: #fff;
        color: var(--leaf);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
      }
      .btn-ghost {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.35);
      }
      .hero-card {
        background: rgba(255, 255, 255, 0.94);
        color: var(--dark);
        border-radius: 32px;
        padding: 24px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.16);
        border: 1px solid rgba(255, 255, 255, 0.6);
      }
      .hero-card h2 {
        margin: 0 0 14px;
        color: var(--leaf);
        font-size: 1.45rem;
      }
      .mini-stat {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 16px;
      }
      .stat {
        border-radius: 22px;
        background: linear-gradient(180deg, #f7fff2, #fff9e8);
        padding: 16px;
        border: 1px solid var(--line);
      }
      .stat strong {
        display: block;
        font-size: 2rem;
        line-height: 1;
        color: var(--leaf);
      }
      .nav {
        position: sticky;
        top: 0;
        z-index: 5;
        margin: 0 auto 26px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid var(--line);
        border-radius: 999px;
        box-shadow: 0 12px 40px rgba(20, 51, 31, 0.1);
        backdrop-filter: blur(14px);
        padding: 8px;
        display: flex;
        gap: 6px;
        overflow: auto;
        scrollbar-width: none;
      }
      .nav::-webkit-scrollbar {
        display: none;
      }
      .nav a {
        text-decoration: none;
        padding: 10px 16px;
        border-radius: 999px;
        font-weight: 900;
        color: var(--dark);
        white-space: nowrap;
      }
      .nav a:hover {
        background: var(--mint);
        color: var(--leaf);
      }
      section {
        margin: 28px 0;
      }
      .section {
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid var(--line);
        border-radius: var(--r);
        box-shadow: 0 18px 60px rgba(20, 51, 31, 0.08);
        padding: 34px;
        overflow: hidden;
        position: relative;
      }
      .section:before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 8px;
        background: linear-gradient(90deg, var(--leaf), var(--gold), #b7793d);
      }
      .title {
        display: flex;
        gap: 14px;
        align-items: center;
        margin: 0 0 16px;
      }
      .icon {
        width: 54px;
        height: 54px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: linear-gradient(135deg, var(--mint), #fff9d6);
        font-size: 1.8rem;
        flex: 0 0 auto;
      }
      h2 {
        margin: 0;
        font-size: clamp(1.75rem, 2.7vw, 2.65rem);
        line-height: 1.2;
      }
      h3 {
        font-size: 1.35rem;
        margin: 22px 0 8px;
        color: var(--leaf);
      }
      p {
        margin: 0 0 12px;
      }
      .lead {
        font-size: 1.12rem;
        color: #405141;
      }
      .grid {
        display: grid;
        gap: 18px;
      }
      .g2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .g3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .g4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .card {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 22px;
        box-shadow: 0 12px 34px rgba(20, 51, 31, 0.08);
        min-width: 0;
      }
      .card h3 {
        margin-top: 0;
      }
      .num {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: var(--leaf);
        color: #fff;
        font-weight: 900;
        margin-bottom: 12px;
      }
      .lesson {
        position: relative;
        padding-top: 26px;
      }
      .lesson:after {
        content: "";
        position: absolute;
        top: 0;
        left: 22px;
        right: 22px;
        height: 6px;
        border-radius: 99px;
        background: linear-gradient(90deg, var(--leaf), #8bc34a, var(--gold));
      }
      .badge {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        padding: 6px 12px;
        border-radius: 999px;
        background: #f4fbef;
        color: var(--leaf);
        border: 1px solid var(--line);
        font-weight: 900;
        margin-bottom: 10px;
      }
      .steps {
        counter-reset: step;
        display: grid;
        gap: 14px;
        margin-top: 16px;
      }
      .step {
        counter-increment: step;
        display: grid;
        grid-template-columns: 54px 1fr;
        gap: 16px;
        align-items: start;
        padding: 18px;
        border-radius: 24px;
        background: linear-gradient(180deg, #fff, #fbfff7);
        border: 1px solid var(--line);
      }
      .step:before {
        content: counter(step);
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: linear-gradient(135deg, var(--leaf), var(--leaf2));
        color: #fff;
        font-weight: 900;
        font-size: 1.2rem;
        box-shadow: 0 12px 26px rgba(31, 122, 58, 0.18);
      }
      .step h3 {
        margin: 0 0 4px;
      }
      .callout {
        border-radius: 24px;
        padding: 22px;
        background: linear-gradient(135deg, #fff8df, #edfbe9);
        border: 1px solid rgba(183, 121, 61, 0.26);
        box-shadow: 0 12px 34px rgba(122, 75, 34, 0.08);
        margin-top: 16px;
      }
      .callout strong {
        color: var(--soil);
      }
      .checklist {
        display: grid;
        gap: 10px;
        padding: 0;
        margin: 14px 0 0;
        list-style: none;
      }
      .checklist li {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 12px 14px;
        border-radius: 18px;
        background: #fff;
        border: 1px solid var(--line);
      }
      .checklist li:before {
        content: "✓";
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #fff;
        background: var(--leaf);
        flex: 0 0 auto;
        font-weight: 900;
        margin-top: 2px;
      }
      .table-wrap {
        overflow: auto;
        border-radius: 22px;
        border: 1px solid var(--line);
        background: #fff;
        box-shadow: 0 10px 28px rgba(20, 51, 31, 0.06);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 760px;
      }
      th,
      td {
        padding: 16px;
        text-align: left;
        vertical-align: top;
        border-bottom: 1px solid rgba(31, 122, 58, 0.12);
      }
      th {
        background: linear-gradient(180deg, #ecfae7, #fff8de);
        font-weight: 900;
      }
      tr:last-child td {
        border-bottom: 0;
      }
      .timeline {
        display: grid;
        gap: 14px;
      }
      .timeline-item {
        display: grid;
        grid-template-columns: 170px 1fr;
        gap: 18px;
        border-bottom: 1px dashed rgba(31, 122, 58, 0.24);
        padding: 16px 0;
      }
      .timeline-item:last-child {
        border-bottom: 0;
      }
      .time {
        font-weight: 900;
        color: var(--leaf);
      }
      details {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 16px 18px;
        box-shadow: 0 8px 24px rgba(20, 51, 31, 0.06);
      }
      details + details {
        margin-top: 10px;
      }
      summary {
        cursor: pointer;
        font-weight: 900;
        color: var(--leaf);
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary:before {
        content: "▸";
        display: inline-block;
        margin-right: 8px;
        transition: 0.2s;
      }
      details[open] summary:before {
        transform: rotate(90deg);
      }
      .footer {
        margin: 30px auto 24px;
        text-align: center;
        color: #506351;
        padding: 26px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid var(--line);
      }
      @media (max-width: 940px) {
        .hero-inner {
          grid-template-columns: 1fr;
          padding: 36px;
        }
        .g2,
        .g3,
        .g4 {
          grid-template-columns: 1fr;
        }
        .timeline-item {
          grid-template-columns: 1fr;
        }
        .nav {
          border-radius: 20px;
        }
      }
      @media print {
        body {
          background: #fff;
          color: #111;
        }
        .nav,
        .btns {
          display: none;
        }
        .hero,
        .section,
        .card,
        .callout,
        .footer {
          box-shadow: none;
          border: 1px solid #ccc;
          background: #fff;
          color: #111;
        }
        .hero p {
          color: #111;
        }
        .hero {
          min-height: auto;
        }
        .section {
          break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <header class="hero page">
      <div class="hero-inner">
        <div>
          <span class="eyebrow">🌱 คู่มือสำหรับครูผู้สอน</span>
          <h1>คู่มือการใช้งานระบบเกมแบบฝึกทักษะออนไลน์</h1>
          <p>
            สื่อการเรียนรู้เรื่องการแก้ปัญหาอย่างเป็นขั้นตอน
            สำหรับนักเรียนชั้นประถมศึกษาปีที่ 4 ออกแบบเป็นภารกิจฟาร์ม
            เพื่อให้ผู้เรียนเรียนรู้ผ่านการลงมือทำอย่างสนุก เข้าใจง่าย
            และเป็นระบบ
          </p>
          <div class="btns">
            <a class="btn btn-primary" href="#quick">เริ่มใช้งานอย่างรวดเร็ว</a
            ><a class="btn btn-ghost" href="#flow">แนวทางจัดกิจกรรม</a>
          </div>
        </div>
        <aside class="hero-card">
          <h2>ภาพรวมระบบ</h2>
          <p>
            ระบบนี้ช่วยครูจัดการชั้นเรียน ติดตามผลการเล่นเกม ตรวจชิ้นงาน
            และใช้เป็นสื่อประกอบการเรียนรู้แบบมีส่วนร่วม
          </p>
          <div class="mini-stat">
            <div class="stat"><strong>4</strong><span>บทเรียนหลัก</span></div>
            <div class="stat"><strong>12</strong><span>ด่านภารกิจ</span></div>
            <div class="stat">
              <strong>1</strong><span>รหัสเข้าชั้นเรียน</span>
            </div>
            <div class="stat"><strong>∞</strong><span>โอกาสฝึกซ้ำ</span></div>
          </div>
        </aside>
      </div>
    </header>

    <nav class="nav page">
      <a href="#overview">ภาพรวม</a><a href="#lessons">เนื้อหา 4 บท</a
      ><a href="#quick">เริ่มใช้งาน</a><a href="#control">ควบคุมชั้นเรียน</a
      ><a href="#students">เส้นทางนักเรียน</a><a href="#assessment">ประเมินผล</a
      ><a href="#assessment-module">ข้อสอบก่อน–หลัง</a><a href="#survey-module">แบบสอบถาม</a><a href="#flow">แผนจัดกิจกรรม</a><a href="#faq">คำถามที่พบบ่อย</a>
    </nav>

    <main class="page">
      <section id="overview" class="section">
        <div class="title">
          <div class="icon">🌾</div>
          <div>
            <h2>1. ภาพรวมของสื่อ</h2>
            <p class="lead">
              ระบบเกมแบบฝึกทักษะออนไลน์นี้ออกแบบให้ครูใช้จัดกิจกรรมการเรียนรู้วิทยาการคำนวณอย่างเป็นขั้นตอน
              ผ่านสถานการณ์จำลองในฟาร์ม
            </p>
          </div>
        </div>
        <div class="grid g3">
          <div class="card">
            <div class="num">1</div>
            <h3>ครูจัดการห้องเรียน</h3>
            <p>
              ครูสร้างห้องเรียน แจ้งรหัสเข้าชั้นเรียนให้นักเรียน
              และควบคุมการเริ่มหรือหยุดกิจกรรมได้ตามจังหวะการสอน
            </p>
          </div>
          <div class="card">
            <div class="num">2</div>
            <h3>นักเรียนเรียนรู้ผ่านเกม</h3>
            <p>
              นักเรียนอ่านเกร็ดความรู้ เลือกบทเรียน เล่นภารกิจ
              และฝึกแก้ปัญหาตามลำดับความยากที่เพิ่มขึ้น
            </p>
          </div>
          <div class="card">
            <div class="num">3</div>
            <h3>ครูติดตามผลได้ทันที</h3>
            <p>
              ครูดูคะแนน ความก้าวหน้า ชิ้นงาน
              และใช้ข้อมูลเพื่อช่วยเหลือนักเรียนที่ยังต้องการการเสริมแรง
            </p>
          </div>
        </div>
        <div class="callout">
          <strong>หลักการใช้งาน:</strong>
          ครูควรใช้ระบบนี้เป็นสื่อประกอบการจัดกิจกรรม โดยมีช่วงนำเข้าสู่บทเรียน
          ช่วงเล่นภารกิจ ช่วงอภิปรายผล และช่วงสรุปความรู้ร่วมกัน
        </div>
      </section>

      <section id="lessons" class="section">
        <div class="title">
          <div class="icon">🥕</div>
          <div>
            <h2>2. เนื้อหา 4 บทเรียน</h2>
            <p class="lead">
              บทเรียนเรียงจากพื้นฐานที่จับต้องง่าย ไปสู่แนวคิดที่ซับซ้อนขึ้น
              โดยยังคงใช้บริบทฟาร์มเป็นตัวช่วยให้ผู้เรียนเข้าใจ
            </p>
          </div>
        </div>
        <div class="grid g2">
          <article class="card lesson">
            <span class="badge">บทที่ 1</span>
            <h3>ตรรกะคัดแยก</h3>
            <p><strong>สาระสำคัญ:</strong> การใช้เหตุผลเชิงตรรกะ</p>
            <p>
              ผู้เรียนฝึกสังเกตเงื่อนไข แยกแยะข้อมูล และเลือกสิ่งที่ตรงตามโจทย์
              เช่น เมล็ดพันธุ์ ปุ๋ย และวัชพืช
            </p>
            <p>
              <strong>บทบาทของครู:</strong> ชวนผู้เรียนอธิบายเหตุผลว่า
              “ทำไมจึงเลือกสิ่งนี้” และ “สิ่งใดไม่ตรงเงื่อนไข”
            </p>
          </article>
          <article class="card lesson">
            <span class="badge">บทที่ 2</span>
            <h3>เส้นทางเดินรถไถ</h3>
            <p><strong>สาระสำคัญ:</strong> การเรียงลำดับขั้นตอน</p>
            <p>
              ผู้เรียนวางแผนลำดับคำสั่งเพื่อพารถไถไปยังเป้าหมาย หลบสิ่งกีดขวาง
              และเก็บผลผลิตให้ครบ
            </p>
            <p>
              <strong>บทบาทของครู:</strong>
              เน้นให้ผู้เรียนเห็นว่าการสลับลำดับเพียงเล็กน้อย
              อาจทำให้ผลลัพธ์เปลี่ยนไป
            </p>
          </article>
          <article class="card lesson">
            <span class="badge">บทที่ 3</span>
            <h3>ผู้จัดการฟาร์มอัจฉริยะ</h3>
            <p><strong>สาระสำคัญ:</strong> การใช้เงื่อนไข</p>
            <p>
              ผู้เรียนสร้างกฎให้ระบบสายพานคัดแยกผลผลิต เช่น ผัก ผลไม้
              และผลผลิตจากสัตว์ ให้ไปยังปลายทางที่ถูกต้อง
            </p>
            <p>
              <strong>บทบาทของครู:</strong> ช่วยผู้เรียนเชื่อมโยงคำว่า “ถ้า...”
              กับการตัดสินใจของระบบในชีวิตประจำวัน
            </p>
          </article>
          <article class="card lesson">
            <span class="badge">บทที่ 4</span>
            <h3>ซ่อมกฎฟาร์มอัจฉริยะ</h3>
            <p><strong>สาระสำคัญ:</strong> การตรวจสอบและแก้ไขข้อผิดพลาด</p>
            <p>
              ผู้เรียนทดสอบกฎที่ระบบตั้งไว้ สังเกตผลลัพธ์ที่ผิด
              และแก้ไขให้ระบบฟาร์มกลับมาทำงานถูกต้อง
            </p>
            <p>
              <strong>บทบาทของครู:</strong> กระตุ้นให้ผู้เรียนอธิบายว่า
              “ผิดตรงไหน” และ “ควรแก้อย่างไร” ก่อนลองใหม่
            </p>
          </article>
        </div>
      </section>

      <section id="quick" class="section">
        <div class="title">
          <div class="icon">🚜</div>
          <div>
            <h2>3. เริ่มใช้งานสำหรับครู</h2>
            <p class="lead">
              ขั้นตอนพื้นฐานตั้งแต่เข้าสู่ระบบ สร้างห้องเรียน เพิ่มนักเรียน
              และเริ่มกิจกรรมในชั้นเรียน
            </p>
          </div>
        </div>
        <div class="steps">
          <div class="step">
            <div>
              <h3>เข้าสู่ระบบครู</h3>
              <p>
                ครูเข้าสู่ระบบด้วยบัญชีของตนเอง
                จากนั้นระบบจะแสดงหน้าหลักสำหรับจัดการห้องเรียนและติดตามผลการเรียนรู้
              </p>
            </div>
          </div>
          <div class="step">
            <div>
              <h3>สร้างหรือเลือกห้องเรียน</h3>
              <p>
                เลือกห้องเรียนที่ต้องการสอน หรือสร้างห้องเรียนใหม่
                โดยควรตั้งชื่อให้เข้าใจง่าย เช่น “ป.4/1 วิทยาการคำนวณ”
              </p>
            </div>
          </div>
          <div class="step">
            <div>
              <h3>แจ้งรหัสเข้าชั้นเรียน</h3>
              <p>
                ครูแจ้งรหัสเข้าชั้นเรียนให้นักเรียนใช้เข้าสู่ห้องเรียนออนไลน์ของตนเอง
              </p>
            </div>
          </div>
          <div class="step">
            <div>
              <h3>เพิ่มรายชื่อนักเรียน</h3>
              <p>
                ครูสามารถเพิ่มรายชื่อนักเรียนทีละคน
                หรือนำเข้ารายชื่อเป็นชุดตามที่ระบบรองรับ
              </p>
            </div>
          </div>
          <div class="step">
            <div>
              <h3>เริ่มบทเรียน</h3>
              <p>
                ครูเลือกบทเรียน สาธิตวิธีเล่นสั้น ๆ
                แล้วให้นักเรียนเริ่มทำภารกิจตามลำดับ
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="control" class="section">
        <div class="title">
          <div class="icon">🧑‍🌾</div>
          <div>
            <h2>4. การควบคุมชั้นเรียนของครู</h2>
            <p class="lead">
              ครูสามารถจัดจังหวะการเรียนรู้ของทั้งห้องได้
              เพื่อให้ผู้เรียนเรียนไปพร้อมกันหรือเปิดโอกาสให้ฝึกด้วยตนเอง
            </p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ส่วนที่ครูใช้งาน</th>
                <th>ใช้เพื่ออะไร</th>
                <th>คำแนะนำในการใช้</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>อนุญาตให้เข้าเรียน</td>
                <td>เปิดให้ผู้เรียนเข้าสู่บทเรียนและเริ่มทำกิจกรรม</td>
                <td>
                  ใช้เมื่อครูอธิบายกติกาเสร็จ และพร้อมให้ผู้เรียนเริ่มเล่น
                </td>
              </tr>
              <tr>
                <td>ระงับชั่วคราว</td>
                <td>หยุดการเข้าใช้งานชั่วคราวเมื่อต้องการอธิบายเพิ่มเติม</td>
                <td>
                  ใช้เมื่อพบว่าผู้เรียนหลายคนเข้าใจผิด
                  หรือครูต้องการสรุปแนวคิดร่วมกัน
                </td>
              </tr>
              <tr>
                <td>ล็อกภารกิจ</td>
                <td>ควบคุมไม่ให้ผู้เรียนข้ามไปด่านถัดไปเร็วเกินไป</td>
                <td>เหมาะกับการสอนแบบทั้งห้องเรียนไปพร้อมกัน</td>
              </tr>
              <tr>
                <td>ปลดล็อกภารกิจ</td>
                <td>เปิดให้ผู้เรียนทำภารกิจถัดไปได้</td>
                <td>ใช้หลังจากครูตรวจสอบว่าผู้เรียนส่วนใหญ่พร้อมแล้ว</td>
              </tr>
              <tr>
                <td>ตรวจชิ้นงาน</td>
                <td>ดูผลงานที่นักเรียนสร้างหลังเล่นบทเรียน</td>
                <td>
                  ใช้ประกอบการประเมินทักษะการคิด การอธิบาย
                  และการสร้างโจทย์ของผู้เรียน
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="students" class="section">
        <div class="title">
          <div class="icon">🌽</div>
          <div>
            <h2>5. เส้นทางการใช้งานของนักเรียน</h2>
            <p class="lead">
              ครูควรอธิบายขั้นตอนให้นักเรียนเข้าใจก่อนเริ่มใช้งาน
              เพื่อให้การเรียนรู้เป็นไปอย่างราบรื่น
            </p>
          </div>
        </div>
        <div class="grid g4">
          <div class="card">
            <h3>1. เข้าชั้นเรียน</h3>
            <p>นักเรียนใช้รหัสเข้าชั้นเรียนและข้อมูลประจำตัวตามที่ครูกำหนด</p>
          </div>
          <div class="card">
            <h3>2. อ่านเกร็ดความรู้</h3>
            <p>นักเรียนอ่านคำอธิบายสั้น ๆ เพื่อเตรียมความเข้าใจก่อนเล่นเกม</p>
          </div>
          <div class="card">
            <h3>3. เล่นภารกิจ</h3>
            <p>นักเรียนทำภารกิจในแต่ละด่าน ฝึกคิด วางแผน ทดลอง และแก้ไข</p>
          </div>
          <div class="card">
            <h3>4. สรุปผล</h3>
            <p>
              นักเรียนดูคะแนนของตนเอง แล้วครูช่วยชวนสะท้อนว่าทำได้ดีตรงไหน
              และควรปรับตรงไหน
            </p>
          </div>
        </div>
        <div class="callout">
          <strong>คำแนะนำ:</strong> เมื่อนักเรียนเล่นจบแต่ละด่าน
          ครูควรถามคำถามสั้น ๆ เช่น “ด่านนี้ต้องคิดอะไรก่อน”,
          “ทำไมคำตอบนี้จึงถูก” หรือ “ถ้าผิด ควรเริ่มตรวจตรงไหน”
        </div>
      </section>

      <section id="assessment" class="section">
        <div class="title">
          <div class="icon">📊</div>
          <div>
            <h2>6. การติดตามผลและประเมินการเรียนรู้</h2>
            <p class="lead">
              ระบบช่วยให้ครูเห็นพัฒนาการของผู้เรียนจากคะแนน ความพยายาม
              และผลงานที่นักเรียนสร้าง
            </p>
          </div>
        </div>
        <div class="grid g3">
          <div class="card">
            <h3>คะแนนและดาวภารกิจ</h3>
            <p>
              ใช้ดูภาพรวมความสำเร็จของนักเรียนแต่ละคน
              เหมาะสำหรับการสังเกตความก้าวหน้าเบื้องต้น
            </p>
          </div>
          <div class="card">
            <h3>จำนวนครั้งที่พยายาม</h3>
            <p>
              ช่วยให้ครูเห็นว่านักเรียนคนใดต้องใช้เวลาหรือพยายามหลายครั้ง
              ควรได้รับการช่วยเหลือเพิ่มเติม
            </p>
          </div>
          <div class="card">
            <h3>ชิ้นงานของนักเรียน</h3>
            <p>
              ใช้ประเมินความเข้าใจเชิงลึก เช่น
              นักเรียนออกแบบโจทย์ได้เหมาะสมหรืออธิบายเงื่อนไขได้ชัดเจนหรือไม่
            </p>
          </div>
        </div>
        <h3>แนวทางตีความผล</h3>
        <ul class="checklist">
          <li>
            คะแนนสูงและใช้ความพยายามน้อย
            แสดงว่านักเรียนเข้าใจแนวคิดของด่านนั้นค่อนข้างดี
          </li>
          <li>
            คะแนนดีแต่พยายามหลายครั้ง แสดงว่านักเรียนเรียนรู้จากการลองผิดลองถูก
            ควรชวนสะท้อนวิธีคิด
          </li>
          <li>
            คะแนนต่ำหรือหยุดอยู่ด่านเดิมนาน ควรให้คำแนะนำทีละขั้น
            และจับคู่กับเพื่อนช่วยเรียนรู้
          </li>
        </ul>
      </section>

      <section id="flow" class="section">
        <div class="title">
          <div class="icon">🌻</div>
          <div>
            <h2>7. ตัวอย่างแผนการใช้ในชั้นเรียน</h2>
            <p class="lead">
              ครูสามารถปรับเวลาให้เหมาะสมกับบริบทของห้องเรียน จำนวนอุปกรณ์
              และระดับความพร้อมของผู้เรียน
            </p>
          </div>
        </div>
        <div class="timeline">
          <div class="timeline-item">
            <div class="time">🌤️ 5 นาทีแรก</div>
            <div>
              <h3>นำเข้าสู่บทเรียน</h3>
              <p>
                ครูตั้งคำถามเชื่อมโยงกับชีวิตจริง เช่น
                “ถ้าเราต้องคัดผลผลิตในฟาร์ม เราจะตัดสินใจจากอะไร”
              </p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="time">🌱 5–10 นาที</div>
            <div>
              <h3>อธิบายกติกาและสาธิต</h3>
              <p>
                ครูเปิดตัวอย่างหนึ่งด่าน สาธิตวิธีคิด และถามนำให้ผู้เรียนร่วมคิด
              </p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="time">🚜 20–25 นาที</div>
            <div>
              <h3>นักเรียนลงมือทำภารกิจ</h3>
              <p>
                นักเรียนเล่นเกม ครูเดินสังเกต ช่วยถามคำถาม
                และจดประเด็นที่นักเรียนมักเข้าใจผิด
              </p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="time">🌾 10 นาที</div>
            <div>
              <h3>แลกเปลี่ยนและสรุป</h3>
              <p>
                ให้นักเรียนอธิบายวิธีคิด เปรียบเทียบคำตอบ
                และสรุปแนวคิดสำคัญร่วมกัน
              </p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="time">🍀 5 นาทีท้าย</div>
            <div>
              <h3>สร้างชิ้นงานหรือมอบหมายต่อ</h3>
              <p>
                ครูอาจให้นักเรียนสร้างโจทย์ของตนเอง
                หรือนำผลงานไปแสดงในลานโชว์ผลงาน
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" class="section">
        <div class="title">
          <div class="icon">🏡</div>
          <div>
            <h2>8. การใช้ลานโชว์ผลงาน</h2>
            <p class="lead">
              ลานโชว์ผลงานเป็นพื้นที่ให้ผู้เรียนแบ่งปันโจทย์หรือภารกิจที่ตนเองสร้าง
              ช่วยส่งเสริมการเรียนรู้จากเพื่อนสู่เพื่อน
            </p>
          </div>
        </div>
        <div class="grid g2">
          <div class="card">
            <h3>ครูใช้เพื่ออะไร</h3>
            <ul class="checklist">
              <li>เลือกผลงานตัวอย่างมาอภิปรายหน้าชั้นเรียน</li>
              <li>ให้เพื่อนทดลองเล่นผลงานของกันและกัน</li>
              <li>ประเมินความเข้าใจจากการออกแบบโจทย์</li>
              <li>ชื่นชมผลงานที่มีความคิดสร้างสรรค์</li>
            </ul>
          </div>
          <div class="card">
            <h3>ข้อควรแนะนำผู้เรียน</h3>
            <ul class="checklist">
              <li>ตั้งชื่อผลงานให้สื่อความหมาย</li>
              <li>ออกแบบโจทย์ให้เพื่อนเข้าใจง่าย</li>
              <li>ตรวจสอบผลงานก่อนส่ง</li>
              <li>ให้ความคิดเห็นกับเพื่อนอย่างสุภาพและสร้างสรรค์</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="visitor" class="section">
        <div class="title">
          <div class="icon">👀</div>
          <div>
            <h2>9. โหมดผู้เยี่ยมชม</h2>
            <p class="lead">
              โหมดผู้เยี่ยมชมเหมาะสำหรับครู ผู้บริหาร กรรมการ
              หรือผู้สนใจที่ต้องการทดลองใช้งานระบบโดยไม่ต้องใช้บัญชีนักเรียน
            </p>
          </div>
        </div>
        <div class="callout">
          <strong>หลักสำคัญ:</strong> ผู้เยี่ยมชมสามารถทดลองเล่นได้
          แต่คะแนนและผลงานจะไม่ถูกบันทึกถาวร และจะไม่ปะปนกับข้อมูลนักเรียนจริง
        </div>
        <div class="grid g3">
          <div class="card">
            <h3>ใช้เมื่อใด</h3>
            <p>
              ใช้เมื่อต้องการสาธิตระบบให้ผู้สนใจทดลองเล่นอย่างรวดเร็ว
              โดยไม่ต้องเตรียมรายชื่อนักเรียน
            </p>
          </div>
          <div class="card">
            <h3>ทำอะไรได้</h3>
            <p>
              อ่านเกร็ดความรู้ เลือกบทเรียน เล่นภารกิจ และดูผลคะแนนชั่วคราวได้
            </p>
          </div>
          <div class="card">
            <h3>ข้อจำกัด</h3>
            <p>
              ไม่สามารถบันทึกผลงานถาวรหรือส่งงานให้ครูตรวจได้
              หากต้องการใช้งานครบถ้วนควรเข้าสู่ระบบนักเรียน
            </p>
          </div>
        </div>
      </section>

      <section id="faq" class="section">
        <div class="title">
          <div class="icon">💬</div>
          <div>
            <h2>10. คำถามที่พบบ่อย</h2>
            <p class="lead">
              รวบรวมคำตอบสำหรับสถานการณ์ที่ครูอาจพบระหว่างใช้งานในห้องเรียน
            </p>
          </div>
        </div>
        <details>
          <summary>ถ้านักเรียนเข้าเรียนไม่ได้ ควรตรวจสอบอะไรก่อน</summary>
          <p>
            ให้ตรวจสอบว่ารหัสเข้าชั้นเรียนถูกต้องหรือไม่
            นักเรียนใช้ข้อมูลประจำตัวตรงกับที่ครูเพิ่มไว้หรือไม่
            และสถานะการเข้าเรียนถูกเปิดใช้งานแล้วหรือยัง
          </p>
        </details>
        <details>
          <summary>ถ้านักเรียนเล่นด่านต่อไปไม่ได้ ควรทำอย่างไร</summary>
          <p>
            ตรวจสอบว่ารหัสเข้าชั้นเรียนถูกต้องหรือไม่
            นักเรียนใช้ข้อมูลประจำตัวตรงกับที่ครูเพิ่มไว้หรือไม่
            และสถานะการเข้าเรียนถูกเปิดใช้งานแล้วหรือยัง
          </p>
        </details>
        <details>
          <summary>ถ้านักเรียนได้คะแนนน้อย ควรให้เล่นซ้ำหรือไม่</summary>
          <p>
            ควรให้เล่นซ้ำได้ เพราะระบบออกแบบให้ผู้เรียนฝึกจากการลองผิดลองถูก
            ครูควรถามให้นักเรียนอธิบายวิธีคิดก่อนลองใหม่
          </p>
        </details>
        <details>
          <summary>ควรใช้ระบบนี้เดี่ยว ๆ หรือใช้ร่วมกับการสอนหน้าชั้น</summary>
          <p>
            ควรใช้ร่วมกับการสอนหน้าชั้น โดยครูนำเข้าสู่บทเรียน สาธิตเล็กน้อย
            ให้ผู้เรียนลงมือทำ แล้วสรุปความรู้ร่วมกันหลังจบกิจกรรม
          </p>
        </details>
        <details>
          <summary>ชิ้นงานนักเรียนควรประเมินจากอะไร</summary>
          <p>
            ควรพิจารณาจากความชัดเจนของโจทย์ ความถูกต้องของเงื่อนไข
            ความเหมาะสมของภารกิจ และความสามารถของผู้เรียนในการอธิบายเหตุผล
          </p>
        </details>
      </section>

      <section id="assessment-module" class="section">
        <div class="title"><div class="icon">📝</div><div><h2>11. การใช้ระบบข้อสอบก่อนเรียน–หลังเรียน</h2><p class="lead">ใช้เมนู Assessment บน Dashboard เพื่อควบคุมการสอบและสรุปผลรายห้องเรียน</p></div></div>
        <div class="grid g2">
          <div class="card"><h3>เตรียมและเปิดข้อสอบ</h3><ul class="checklist"><li>ตรวจชุดข้อสอบในเมนู “จัดการข้อสอบ”</li><li>เลือกชุด Pre-test และ Post-test ใน “ตั้งค่าการสอบ”</li><li>เปิด Pre-test และเลือกบังคับทำก่อนเข้าเกมได้</li><li>เปิด Post-test เมื่อจบกิจกรรมตามแผนการสอน</li><li>ข้อสอบที่มีผู้ทำแล้วควรสร้างเวอร์ชันใหม่แทนการแก้ทับ</li></ul></div>
          <div class="card"><h3>ติดตามและนำผลไปใช้</h3><ul class="checklist"><li>ดูคะแนนรายคนและผลต่างก่อน–หลัง</li><li>ดูค่าเฉลี่ย SD, E1 และ E2</li><li>วิเคราะห์คะแนนแยกตามบทเรียนทั้ง 4 บท</li><li>Reset รายคนเมื่อมีเหตุจำเป็น</li><li>Export CSV สำหรับจัดทำรายงาน Best Practice</li></ul></div>
        </div>
        <div class="note"><strong>ข้อสำคัญ:</strong> แบบทดสอบต้องทำในโหมดรายบุคคล ระบบจะไม่อนุญาตให้กลุ่มทำข้อสอบร่วมกัน และจะไม่แสดงเฉลยรายข้อแก่นักเรียน</div>
      </section>

      <section id="survey-module" class="section">
        <div class="title"><div class="icon">💬</div><div><h2>12. การใช้แบบสอบถามความพึงพอใจ</h2><p class="lead">เก็บความคิดเห็นรายบุคคลหลังผู้เรียนใช้งานเกมและทำ Post-test แล้ว เพื่อนำไปปรับปรุงสื่อและจัดทำรายงาน Best Practice</p></div></div>
        <div class="grid g2">
          <div class="card"><h3>ตั้งค่าและเปิดรับคำตอบ</h3><ul class="checklist"><li>เข้าเมนู “ตั้งค่าแบบสอบถาม” บน Dashboard</li><li>เลือกชุดแบบสอบถามและสถานะ “เปิดรับ”</li><li>เลือกบังคับให้ส่ง Post-test ก่อนตอบได้</li><li>ไม่ควรเปิดให้แก้ไขหลังส่ง ยกเว้นมีเหตุจำเป็น</li><li>แบบสอบถามตอบได้เฉพาะโหมดรายบุคคล</li></ul></div>
          <div class="card"><h3>รายงานและการส่งออก</h3><ul class="checklist"><li>ดูจำนวนและร้อยละของผู้ตอบ</li><li>ดูค่าเฉลี่ยและ S.D. รายข้อ รายด้าน และภาพรวม</li><li>ดูสถานะรายคนและ Reset เมื่อต้องการให้ตอบใหม่</li><li>Export CSV แบบรายบุคคล รายด้าน และความคิดเห็นปลายเปิด</li><li>ใช้ตารางรายด้านประกอบรายงาน Best Practice</li></ul></div>
        </div>
        <div class="note"><strong>ข้อสำคัญ:</strong> ความพึงพอใจไม่ใช่คะแนนผลสัมฤทธิ์ ห้ามนำไปรวมกับคะแนนเกมหรือคะแนนข้อสอบ และไม่ควรเปิดเผยความคิดเห็นรายคนให้นักเรียนคนอื่นเห็น</div>
      </section>

      <section id="check" class="section">
        <div class="title">
          <div class="icon">✅</div>
          <div>
            <h2>13. รายการตรวจสอบก่อนใช้จริง</h2>
            <p class="lead">
              ครูสามารถใช้รายการนี้ตรวจความพร้อมก่อนนำระบบไปใช้กับนักเรียนทั้งห้อง
            </p>
          </div>
        </div>
        <div class="grid g2">
          <div class="card">
            <h3>ก่อนเริ่มคาบเรียน</h3>
            <ul class="checklist">
              <li>สร้างหรือเลือกห้องเรียนเรียบร้อยแล้ว</li>
              <li>เพิ่มรายชื่อนักเรียนครบถ้วน</li>
              <li>เตรียมรหัสเข้าชั้นเรียนให้นักเรียน</li>
              <li>ทดสอบเข้าใช้งานด้วยตนเองอย่างน้อย 1 ครั้ง</li>
              <li>เตรียมคำถามนำเข้าสู่บทเรียน</li>
              <li>เลือกชุดข้อสอบและตรวจสถานะเปิด–ปิด Pre-test/Post-test</li>
            </ul>
          </div>
          <div class="card">
            <h3>ระหว่างและหลังเรียน</h3>
            <ul class="checklist">
              <li>สังเกตว่านักเรียนเข้าใจเป้าหมายของแต่ละด่านหรือไม่</li>
              <li>ช่วยเหลือนักเรียนที่ติดอยู่ด่านเดิมนาน</li>
              <li>สรุปแนวคิดสำคัญหลังเล่นเกม</li>
              <li>ตรวจชิ้นงานหรือเลือกผลงานตัวอย่างมาอภิปราย</li>
              <li>ใช้ผลคะแนนเพื่อวางแผนเสริมทักษะครั้งถัดไป</li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer page">
      <strong><?php echo htmlspecialchars($app['app_name']); ?></strong><br />
      เรื่อง การแก้ปัญหาอย่างเป็นขั้นตอน สำหรับนักเรียนชั้นประถมศึกษาปีที่ 4<br />
      ธีมภารกิจฟาร์มแก้ปัญหา • คู่มือสำหรับครูผู้สอน
    </footer>
  </body>
</html>
