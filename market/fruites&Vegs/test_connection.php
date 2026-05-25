<!DOCTYPE html>
<html>
<head>
  <title>Roots – DB Connection Test</title>
  <style>
    body { font-family: sans-serif; padding: 40px; background: #f5f5f5; }
    .box { background: white; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    h2   { color: #1C4A2A; margin-bottom: 20px; }
    .ok  { background: #d1fae5; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 10px 0; color: #065f46; font-weight: 600; }
    .err { background: #fee2e2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 8px; margin: 10px 0; color: #991b1b; font-weight: 600; }
    .info{ background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 14px 18px; border-radius: 8px; margin: 10px 0; color: #0c4a6e; }
    table{ width:100%; border-collapse:collapse; margin-top:16px; }
    th   { background:#1C4A2A; color:white; padding:10px 14px; text-align:left; font-size:13px; }
    td   { padding:9px 14px; border-bottom:1px solid #eee; font-size:13px; }
    tr:hover td { background:#f9fafb; }
  </style>
</head>
<body>
<div class="box">
  <h2>🌱 Roots – Database Connection Test</h2>
 
  <?php
  $host = '127.0.0.1';
  $port = '3308';
  $db   = 'roots_db';
  $user = 'root';
  $pass = '';
 
  // STEP 1: Try to connect
  try {
      $pdo = new PDO(
          "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
          $user,
          $pass
      );
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      echo '<div class="ok">✅ Connected to database successfully! (Port ' . $port . ')</div>';
  } catch (PDOException $e) {
      echo '<div class="err">❌ Connection FAILED: ' . $e->getMessage() . '</div>';
      echo '<div class="info">💡 Check that XAMPP MySQL is running and your port is correct in db.php</div>';
      exit;
  }
 
  // STEP 2: Check if tables exist
  $tables = ['core_users', 'fv_listings', 'fv_inquiries'];
  echo '<br>';
  foreach ($tables as $table) {
      try {
          $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
          echo "<div class='ok'>✅ Table <strong>$table</strong> exists — $count row(s)</div>";
      } catch (PDOException $e) {
          echo "<div class='err'>❌ Table <strong>$table</strong> not found — did you run roots_db_setup.sql?</div>";
      }
  }
 
  // STEP 3: Show sample listings if they exist
  try {
      $rows = $pdo->query("
          SELECT fv.crop_name, fv.category, fv.price_per_kg, fv.quantity_kg, u.full_name AS farmer
          FROM fv_listings fv
          JOIN core_users u ON fv.user_id = u.id
          LIMIT 5
      ")->fetchAll(PDO::FETCH_ASSOC);
 
      if ($rows) {
          echo '<br><div class="info">📦 Sample listings from your database:</div>';
          echo '<table><tr><th>Produce</th><th>Category</th><th>Price/kg</th><th>Qty (kg)</th><th>Farmer</th></tr>';
          foreach ($rows as $r) {
              echo "<tr>
                <td>{$r['crop_name']}</td>
                <td>{$r['category']}</td>
                <td>₱{$r['price_per_kg']}</td>
                <td>{$r['quantity_kg']}</td>
                <td>{$r['farmer']}</td>
              </tr>";
          }
          echo '</table>';
      } else {
          echo '<br><div class="info">ℹ️ Tables exist but no listings yet. Run roots_db_setup.sql to add sample data.</div>';
      }
  } catch (PDOException $e) {
      // already caught above
  }
  ?>
 
</div>
</body>
</html>