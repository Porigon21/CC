if (CCSE && CCSE.isLoaded) {
    GoldenClickerModInit();
} else {
    if (!window.CCSE) var CCSE = {};
    if (!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
    CCSE.postLoadHooks.push(GoldenClickerModInit);
}

function GoldenClickerModInit() {
    GoldenClickerMod = {};
    GoldenClickerMod.name = 'GoldenClickerMod';
    GoldenClickerMod.version = '1.0';
    GoldenClickerMod.settings = {
        goldenSpeed: false,
        goldenInterval: 1000,
        autoPurchase: false,
    };

    // CCSEにMODを登録
    CCSE.RegisterMod(GoldenClickerMod.name);

    // オプションメニューを作成
    GoldenClickerMod.createMenu = function () {
        CCSE.AppendOptionsMenu(GoldenClickerMod.name, [
            '<div class="listing">',
            '<b>Golden Cookie Spawn Speed</b><br>',
            CCSE.MenuHelper.ToggleButton(
                GoldenClickerMod.settings,
                'goldenSpeed',
                'GoldenClickerMod_toggleGoldenSpeed',
                'Enable',
                'Disable',
                'Toggle golden cookie spawn speed control'
            ),
            '<label>Spawn Interval (4ms - 1000ms): </label>',
            CCSE.MenuHelper.InputBox(
                GoldenClickerMod.settings,
                'goldenInterval',
                'GoldenClickerMod_setGoldenInterval',
                100
            ),
            '</div>',
            '<div class="listing">',
            '<b>Auto Purchase</b><br>',
            CCSE.MenuHelper.ToggleButton(
                GoldenClickerMod.settings,
                'autoPurchase',
                'GoldenClickerMod_toggleAutoPurchase',
                'Enable',
                'Disable',
                'Toggle auto purchasing for buildings and upgrades'
            ),
            '</div>'
        ]);
    };

    // ゴールデンクッキー生成制御
    GoldenClickerMod.modifyGoldenCookies = function () {
        if (GoldenClickerMod.settings.goldenSpeed) {
            if (!GoldenClickerMod.originalSpawnFunction) {
                GoldenClickerMod.originalSpawnFunction = Game.goldenCookie.spawn;
            }
            Game.goldenCookie.spawn = function () {
                setTimeout(() => {
                    GoldenClickerMod.originalSpawnFunction.call(Game.goldenCookie);
                }, GoldenClickerMod.settings.goldenInterval);
            };
        } else if (GoldenClickerMod.originalSpawnFunction) {
            Game.goldenCookie.spawn = GoldenClickerMod.originalSpawnFunction;
        }
    };

    // 自動購入機能
    GoldenClickerMod.autoPurchase = function () {
        if (!GoldenClickerMod.settings.autoPurchase) return;

        // 最安のアップグレードを購入
        let cheapestUpgrade = Game.UpgradesInStore[0];
        if (cheapestUpgrade && Game.cookies >= cheapestUpgrade.getPrice()) {
            cheapestUpgrade.buy();
        }

        // 最安の建物を購入
        let cheapestBuilding = null;
        for (let i in Game.Objects) {
            let building = Game.Objects[i];
            if (!cheapestBuilding || building.getPrice() < cheapestBuilding.getPrice()) {
                cheapestBuilding = building;
            }
        }
        if (cheapestBuilding && Game.cookies >= cheapestBuilding.getPrice()) {
            cheapestBuilding.buy();
        }
    };

    // フックして自動実行
    Game.registerHook('logic', function () {
        GoldenClickerMod.modifyGoldenCookies();
        GoldenClickerMod.autoPurchase();
    });

    // オプションメニューの作成
    GoldenClickerMod.createMenu();

    // ログ出力
    console.log(GoldenClickerMod.name + ' loaded!');
}
