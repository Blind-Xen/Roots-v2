<?php
// ══════════════════════════════════════════════
// api.php — TanimBase Read API (roots_db)
//
// Endpoints:
//   api.php              → all plants (list)
//   api.php?id=1         → single plant with full detail + care guide
//   api.php?tag=medicinal → plants filtered by category tag
//   api.php?search=xxx   → plants matching search keyword
// ══════════════════════════════════════════════

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "db.php";

// ── Format a full plant row (from JOIN query) into clean array ──
function formatPlant($row, $tags = [], $care = null, $guide = null) {
    return [
        "id"             => (int) $row["plant_id"],
        "localName"      => $row["local_name"],
        "sciName"        => $row["sci_name"],
        "family"         => $row["family"],
        "alsoKnown"      => $row["also_known"]
                              ? array_map("trim", explode(",", $row["also_known"]))
                              : [],
        "emoji"          => $row["emoji"],
        "image"          => $row["image"],
        "regions"        => $row["regions"]
                              ? array_map("trim", explode(",", $row["regions"]))
                              : [],
        "height"         => $row["height"],
        "lifespan"       => $row["lifespan"],
        "flowerColor"    => $row["flower_color"],
        "harvestTime"    => $row["harvest_time"],
        "warnings"       => $row["warnings"],
        "videoUrl"       => $row["video_url"],
        "tags"           => $tags,   // array of tag strings e.g. ['medicinal','edible']
        "description"    => $row["description"]  ?? null,
        "uses"           => isset($row["uses"])
                              ? (json_decode($row["uses"], true) ?? [])
                              : [],
        "careWater"      => $care["water"]       ?? null,
        "careLight"      => $care["light"]       ?? null,
        "careSoil"       => $care["soil"]        ?? null,
        "careGrowth"     => $care["growth"]      ?? null,
        "careDifficulty" => $care["difficulty"]  ?? null,
        "careGuide"      => $guide ? [
            "planting"    => $guide["planting"],
            "watering"    => $guide["watering"],
            "pruning"     => $guide["pruning"],
            "fertilizing" => $guide["fertilizing"],
        ] : null,
    ];
}

// ── Fetch tags for a single plant_id ──
function fetchTags($conn, $plantId) {
    $stmt = mysqli_prepare($conn,
        "SELECT pc.tag
         FROM plant_category_map m
         JOIN plant_categories pc ON pc.categoryID = m.categoryID
         WHERE m.plant_id = ?"
    );
    mysqli_stmt_bind_param($stmt, "i", $plantId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $tags   = [];
    while ($r = mysqli_fetch_assoc($result)) {
        $tags[] = $r["tag"];
    }
    return $tags;
}

// ══════════════════════════════════════════════
// ROUTE: Single plant by id
// ══════════════════════════════════════════════
if (isset($_GET["id"])) {
    $id = (int) $_GET["id"];

    // Main plant row + content joined
    $stmt = mysqli_prepare($conn,
        "SELECT pi.*, pc.description, pc.uses
         FROM plant_info pi
         LEFT JOIN plant_content pc ON pc.plant_id = pi.plant_id
         WHERE pi.plant_id = ?"
    );
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

    if (!$row) {
        echo json_encode(["success" => false, "error" => "Plant not found."]);
        exit;
    }

    // Care simple
    $cs = mysqli_prepare($conn,
        "SELECT * FROM plant_care_simple WHERE plant_id = ?"
    );
    mysqli_stmt_bind_param($cs, "i", $id);
    mysqli_stmt_execute($cs);
    $care = mysqli_fetch_assoc(mysqli_stmt_get_result($cs)) ?: null;

    // Care guide
    $cg = mysqli_prepare($conn,
        "SELECT * FROM plant_care_guide WHERE plant_id = ?"
    );
    mysqli_stmt_bind_param($cg, "i", $id);
    mysqli_stmt_execute($cg);
    $guide = mysqli_fetch_assoc(mysqli_stmt_get_result($cg)) ?: null;

    // Tags
    $tags = fetchTags($conn, $id);

    echo json_encode([
        "success" => true,
        "plant"   => formatPlant($row, $tags, $care, $guide)
    ]);

// ══════════════════════════════════════════════
// ROUTE: Filter by tag
// ══════════════════════════════════════════════
} elseif (isset($_GET["tag"]) && $_GET["tag"] !== "all") {
    $tag  = mysqli_real_escape_string($conn, $_GET["tag"]);

    $result = mysqli_query($conn,
        "SELECT pi.*, pc.description, pc.uses
         FROM plant_info pi
         LEFT JOIN plant_content pc ON pc.plant_id = pi.plant_id
         WHERE pi.plant_id IN (
             SELECT m.plant_id
             FROM plant_category_map m
             JOIN plant_categories cat ON cat.categoryID = m.categoryID
             WHERE cat.tag = '$tag'
         )
         ORDER BY pi.local_name ASC"
    );

    $plants = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $plants[] = formatPlant($row, fetchTags($conn, $row["plant_id"]));
    }
    echo json_encode(["success" => true, "plants" => $plants]);

// ══════════════════════════════════════════════
// ROUTE: Search
// ══════════════════════════════════════════════
} elseif (isset($_GET["search"]) && $_GET["search"] !== "") {
    $q = "%" . mysqli_real_escape_string($conn, $_GET["search"]) . "%";

    $result = mysqli_query($conn,
        "SELECT pi.*, pc.description, pc.uses
         FROM plant_info pi
         LEFT JOIN plant_content pc ON pc.plant_id = pi.plant_id
         WHERE pi.local_name  LIKE '$q'
            OR pi.sci_name    LIKE '$q'
            OR pi.family      LIKE '$q'
            OR pi.also_known  LIKE '$q'
            OR pi.regions     LIKE '$q'
            OR pc.description LIKE '$q'
            OR pc.uses        LIKE '$q'
         ORDER BY pi.local_name ASC"
    );

    $plants = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $plants[] = formatPlant($row, fetchTags($conn, $row["plant_id"]));
    }
    echo json_encode(["success" => true, "plants" => $plants]);

// ══════════════════════════════════════════════
// ROUTE: All plants (default)
// ══════════════════════════════════════════════
} else {
    $result = mysqli_query($conn,
        "SELECT pi.*, pc.description, pc.uses
         FROM plant_info pi
         LEFT JOIN plant_content pc ON pc.plant_id = pi.plant_id
         ORDER BY pi.local_name ASC"
    );

    $plants = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $plants[] = formatPlant($row, fetchTags($conn, $row["plant_id"]));
    }
    echo json_encode(["success" => true, "plants" => $plants]);
}

mysqli_close($conn);
?>