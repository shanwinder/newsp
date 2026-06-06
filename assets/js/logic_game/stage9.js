// Stage 9: Smart Farm Manager - Animal Products with If / Else If / Else.
(function () {
    const config = {
        title: 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
        subtitle: 'เกมที่ 3: โรงคัดผลผลิตจากฟาร์มสัตว์ | ฝึกใช้ If / Else If / Else เท่านั้น',
        resultText: 'คุณจัดลำดับ If / Else If / Else เพื่อคัดเกรดผลผลิตจากสัตว์ครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                title: '9-1 คัดเกรดไข่ไก่',
                mission: 'คัดเกรดไข่ไก่ตามขนาดและสภาพเปลือก',
                brief: 'ไข่ใหญ่เปลือกสมบูรณ์เข้าพรีเมียม ไข่เล็กไม่แตกเข้ามาตรฐาน ที่เหลือคัดทิ้ง',
                intro: 'ระบบอ่าน If ก่อน แล้วค่อย Else If ถ้าไม่เข้าเงื่อนไขใดจึงใช้ Else',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'animal_product',
                hint: 'ถ้า [ไข่ใบใหญ่และเปลือกสมบูรณ์] -> [ถาดไข่พรีเมียม] | หรือถ้า [ไข่ใบเล็กแต่ไม่แตก] -> [ถาดไข่มาตรฐาน] | นอกเหนือจากนี้ -> [ถาดคัดทิ้ง]',
                allowReorder: true,
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'premium_egg', label: 'ไข่ใบใหญ่และเปลือกสมบูรณ์', match: { type: 'egg', size: 'large', shell: 'perfect' } },
                    { id: 'standard_egg', label: 'ไข่ใบเล็กแต่ไม่แตก', test: (props) => props.type === 'egg' && props.size === 'small' && props.shell !== 'cracked' }
                ],
                actions: [
                    { id: 'premium_tray', label: 'ถาดไข่พรีเมียม', successText: 'ไข่ใบใหญ่เปลือกสมบูรณ์เข้าถาดพรีเมียม' },
                    { id: 'standard_tray', label: 'ถาดไข่มาตรฐาน', successText: 'ไข่ใบเล็กไม่แตกเข้าถาดมาตรฐาน' },
                    { id: 'reject_tray', label: 'ถาดคัดทิ้ง', successText: 'ไข่ที่ไม่ผ่านเกณฑ์ถูกคัดออกอย่างปลอดภัย' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'large_egg_only', label: 'ไข่ใบใหญ่', match: { type: 'egg', size: 'large' } },
                        { id: 'pretty_shell_egg', label: 'ไข่เปลือกสวย', test: (props) => props.type === 'egg' && (props.color === 'pretty' || props.shell === 'perfect') }
                    ],
                    actions: [
                        { id: 'premium_for_size', label: 'ถาดพรีเมียมเพราะใบใหญ่', routeSlot: 'a', successText: 'ไข่ถูกส่งพรีเมียมตามขนาด' },
                        { id: 'standard_for_color', label: 'ถาดมาตรฐานเพราะสีสวย', routeSlot: 'b', successText: 'ไข่ถูกส่งมาตรฐานตามสีเปลือก' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'ถาดพรีเมียม', icon: '🏆', actions: ['premium_tray'] },
                    { slot: 'b', label: 'ถาดมาตรฐาน', icon: '🥚', actions: ['standard_tray'] },
                    { slot: 'c', label: 'ถาดคัดทิ้ง', icon: '🗑️', actions: ['reject_tray'] }
                ],
                itemQueue: [
                    egg('A', 'large_perfect'), egg('B', 'small_perfect'), egg('C', 'cracked'), egg('D', 'large_cracked_decoy'),
                    egg('E', 'small_pretty_decoy'), egg('F', 'dark_small_decoy'), egg('G', 'shadow_large_decoy'), egg('H', 'large_perfect'),
                    egg('I', 'cracked'), egg('J', 'small_perfect'), egg('K', 'large_cracked_decoy'), egg('L', 'large_perfect')
                ],
                expectedLogic: [
                    { condition: 'premium_egg', action: 'premium_tray' },
                    { condition: 'standard_egg', action: 'standard_tray' },
                    { condition: 'else', action: 'reject_tray' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '9-2 คัดคุณภาพขนแกะ',
                mission: 'คัดคุณภาพขนแกะตามความสะอาดและสภาพขน',
                brief: 'ขนแกะสะอาดและนุ่มเข้าพรีเมียม ขนมีเศษหญ้าเข้าเครื่องทำความสะอาด ที่เหลือรีไซเคิล',
                intro: 'ด่านนี้ต้องอ่านกฎตามลำดับและดูหลายคุณสมบัติของขนแกะ',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'animal_product',
                hint: 'ถ้า [ขนแกะสะอาดและนุ่ม] -> [ม้วนไหมพรมพรีเมียม] | หรือถ้า [ขนแกะมีเศษหญ้า] -> [ส่งไปเครื่องทำความสะอาด] | นอกเหนือจากนี้ -> [ส่งเข้าถังรีไซเคิล]',
                allowReorder: true,
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'premium_wool', label: 'ขนแกะสะอาดและนุ่ม', match: { type: 'wool', clean: true, soft: true } },
                    { id: 'grassy_wool', label: 'ขนแกะมีเศษหญ้า', match: { type: 'wool', hasGrass: true } }
                ],
                actions: [
                    { id: 'premium_yarn', label: 'ม้วนไหมพรมพรีเมียม', successText: 'ขนดีถูกม้วนเป็นไหมพรมพรีเมียม' },
                    { id: 'cleaning_machine', label: 'ส่งไปเครื่องทำความสะอาด', successText: 'เครื่องเป่าลมแยกเศษหญ้าออกจากขนแกะ' },
                    { id: 'recycle_bin', label: 'ส่งเข้าถังรีไซเคิล', successText: 'ขนแกะที่ไม่ผ่านเกณฑ์ถูกส่งเข้าถังรีไซเคิล' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'clean_wool_only', label: 'ขนแกะสะอาด', match: { type: 'wool', clean: true } },
                        { id: 'soft_wool_only', label: 'ขนแกะนุ่มหรือฟู', match: { type: 'wool', soft: true } }
                    ],
                    actions: [
                        { id: 'premium_for_clean', label: 'ไหมพรมพรีเมียมเพราะสะอาด', routeSlot: 'a', successText: 'ขนแกะถูกส่งพรีเมียมตามความสะอาด' },
                        { id: 'clean_dark_wool', label: 'ทำความสะอาดขนสีเข้ม', routeSlot: 'b', successText: 'ขนแกะสีเข้มถูกส่งไปทำความสะอาด' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'ไหมพรมพรีเมียม', icon: '🧶', actions: ['premium_yarn'] },
                    { slot: 'b', label: 'เครื่องทำความสะอาด', icon: '💨', actions: ['cleaning_machine'] },
                    { slot: 'c', label: 'ถังรีไซเคิล', icon: '♻️', actions: ['recycle_bin'] }
                ],
                itemQueue: [
                    wool('A', 'clean_soft'), wool('B', 'grass'), wool('C', 'wet_dirty'), wool('D', 'clean_not_fluffy_decoy'),
                    wool('E', 'tiny_grass_decoy'), wool('F', 'dark_natural_decoy'), wool('G', 'fluffy_wet_decoy'), wool('H', 'clean_soft'),
                    wool('I', 'grass'), wool('J', 'wet_dirty'), wool('K', 'dark_natural_decoy'), wool('L', 'tiny_grass_decoy')
                ],
                expectedLogic: [
                    { condition: 'premium_wool', action: 'premium_yarn' },
                    { condition: 'grassy_wool', action: 'cleaning_machine' },
                    { condition: 'else', action: 'recycle_bin' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '9-3 ตรวจคุณภาพน้ำนม',
                mission: 'ตรวจคุณภาพน้ำนมด้วยอุณหภูมิ และคัดไปยังปลายทางที่เหมาะสม',
                brief: 'ต่ำกว่า 8°C บรรจุขวด, 8-15°C เข้าห้องทำความเย็น, สูงกว่า 15°C คัดทิ้ง',
                intro: 'ด่านยากสุดของบทนี้ ใช้ขอบเขตตัวเลขและตรวจเงื่อนไขจากบนลงล่าง',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'animal_product',
                hint: 'ถ้า [อุณหภูมินมต่ำกว่า 8°C] -> [บรรจุขวดพร้อมขาย] | หรือถ้า [อุณหภูมิ 8-15°C] -> [ส่งเข้าห้องทำความเย็น] | นอกเหนือจากนี้ -> [คัดทิ้ง]',
                allowReorder: true,
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'milk_below_8', label: 'อุณหภูมินมต่ำกว่า 8°C', compare: { key: 'temperature', op: '<', value: 8 } },
                    { id: 'milk_8_to_15', label: 'อุณหภูมิ 8-15°C', test: (props) => props.type === 'milk' && props.temperature >= 8 && props.temperature <= 15 }
                ],
                actions: [
                    { id: 'bottle_ready', label: 'บรรจุขวดพร้อมขาย', successText: 'นมเย็นคุณภาพดีเข้ากล่องบรรจุขวด' },
                    { id: 'cooling_room', label: 'ส่งเข้าห้องทำความเย็น', successText: 'นมเข้าห้องเย็นพร้อมไอเย็นรอบขวด' },
                    { id: 'discard_milk', label: 'คัดทิ้ง', successText: 'นมที่อุณหภูมิสูงถูกคัดออกพร้อมป้ายเตือน' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'milk_not_over_8', label: 'อุณหภูมินมไม่เกิน 8°C', compare: { key: 'temperature', op: '<=', value: 8 } },
                        { id: 'milk_under_15', label: 'อุณหภูมินมต่ำกว่า 15°C', compare: { key: 'temperature', op: '<', value: 15 } }
                    ],
                    actions: [
                        { id: 'bottle_for_label', label: 'บรรจุขวดเพราะฉลากสวย', routeSlot: 'a', successText: 'นมถูกบรรจุขวดตามฉลาก' },
                        { id: 'cool_all_under_15', label: 'ทำความเย็นนมต่ำกว่า 15°C', routeSlot: 'b', successText: 'นมถูกส่งเข้าห้องเย็นตามช่วงกว้าง' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'บรรจุขวด', icon: '🍼', actions: ['bottle_ready'] },
                    { slot: 'b', label: 'ห้องทำความเย็น', icon: '❄️', actions: ['cooling_room'] },
                    { slot: 'c', label: 'คัดทิ้ง', icon: '⚠️', actions: ['discard_milk'] }
                ],
                itemQueue: [
                    milk('A', 6.5, 'cold'), milk('B', 7.9, 'edge_good_decoy'), milk('C', 8, 'edge_cool_decoy'), milk('D', 12, 'cool'),
                    milk('E', 15, 'edge_cool_decoy'), milk('F', 16, 'hot'), milk('G', 22, 'pretty_label_decoy'), milk('H', 5, 'cold'),
                    milk('I', 9, 'cool'), milk('J', 15.1, 'edge_hot_decoy'), milk('K', 7.2, 'fancy_bottle_decoy'), milk('L', 18, 'hot')
                ],
                expectedLogic: [
                    { condition: 'milk_below_8', action: 'bottle_ready' },
                    { condition: 'milk_8_to_15', action: 'cooling_room' },
                    { condition: 'else', action: 'discard_milk' }
                ],
                scoring: defaultScoring()
            }
        ]
    };

    function defaultScoring() {
        return {
            oneStarAccuracy: 0.6,
            twoStarAccuracy: 0.75,
            threeStarAccuracy: 0.9,
            maxDamagedForThreeStars: 1,
            passAccuracy: 0.6
        };
    }

    function asset(key, description) {
        // ASSET NOTE: fallbackIcon ใช้แสดง prototype เท่านั้น ส่วน logic อ่านจาก props
        return {
            key,
            path: `../assets/img/conveyor/animal_products/${key}.png`,
            width: 96,
            height: 96,
            description,
            futureSpriteSheet: {
                path: `../assets/img/conveyor/animal_products/${key}_sheet.png`,
                frameWidth: 96,
                frameHeight: 96,
                animations: ['idle', 'scan', 'route_result', 'wrong_drop']
            }
        };
    }

    function makeItem({ id, key, label, icon, props, expectedAction, sensor, feedback, isDecoy = false, decoyReason = '', inspect }) {
        return {
            id,
            key,
            label,
            category: 'animal_product',
            fallbackIcon: icon,
            isDecoy,
            decoyReason,
            asset: asset(key, `ภาพ${label}สำหรับด่านผลผลิตจากสัตว์`),
            inspect,
            props,
            sensor,
            expectedAction,
            feedback
        };
    }

    function inspect(data, warning) {
        return {
            title: data.label,
            properties: data.properties,
            hint: data.hint,
            warning: data.isDecoy ? warning : ''
        };
    }

    function egg(id, variant) {
        const data = {
            large_perfect: {
                label: 'ไข่ใบใหญ่เปลือกสมบูรณ์', props: { type: 'egg', size: 'large', shell: 'perfect', color: 'normal' }, expectedAction: 'premium_tray',
                sensor: 'ไข่ใบใหญ่และเปลือกสมบูรณ์', feedback: 'ไข่ใบใหญ่เปลือกสมบูรณ์ควรเข้าถาดพรีเมียม',
                properties: ['ขนาด: ใหญ่', 'เปลือก: สมบูรณ์', 'สถานะ: พรีเมียม'], hint: 'ต้องผ่านทั้งขนาดและเปลือก'
            },
            small_perfect: {
                label: 'ไข่ใบเล็กเปลือกสมบูรณ์', props: { type: 'egg', size: 'small', shell: 'perfect', color: 'normal' }, expectedAction: 'standard_tray',
                sensor: 'ไข่ใบเล็กแต่ไม่แตก', feedback: 'ไข่ใบเล็กไม่แตกควรเข้าถาดมาตรฐาน',
                properties: ['ขนาด: เล็ก', 'เปลือก: ไม่แตก', 'สถานะ: มาตรฐาน'], hint: 'ไม่เข้า If แรก แต่เข้า Else If'
            },
            cracked: {
                label: 'ไข่ร้าว', props: { type: 'egg', size: 'small', shell: 'cracked', color: 'normal' }, expectedAction: 'reject_tray',
                sensor: 'เครื่องสแกนพบรอยร้าวบนเปลือกไข่', feedback: 'ไข่ร้าวควรถูกคัดทิ้ง',
                properties: ['ขนาด: เล็ก', 'เปลือก: มีรอยร้าว', 'สถานะ: คัดทิ้ง'], hint: 'ถ้าเปลือกร้าวจะไม่เข้าเงื่อนไขไข่ไม่แตก'
            },
            large_cracked_decoy: {
                label: 'ไข่ใบใหญ่มีรอยร้าว', props: { type: 'egg', size: 'large', shell: 'cracked', color: 'normal' }, expectedAction: 'reject_tray',
                sensor: 'ไข่ใบใหญ่ แต่มีรอยร้าวเล็กน้อย', feedback: 'ไข่ใหญ่แต่ร้าวไม่ควรเข้าพรีเมียม',
                isDecoy: true, decoyReason: 'ไข่ใบนี้ใหญ่ แต่มีรอยร้าวเล็กน้อย จึงไม่ควรเข้าถาดพรีเมียม',
                properties: ['ขนาด: ใหญ่', 'เปลือก: มีรอยร้าว', 'สถานะ: ไม่ผ่านพรีเมียม'], hint: 'พรีเมียมต้องใหญ่และเปลือกสมบูรณ์'
            },
            small_pretty_decoy: {
                label: 'ไข่ใบเล็กเปลือกสวยมาก', props: { type: 'egg', size: 'small', shell: 'perfect', color: 'pretty' }, expectedAction: 'standard_tray',
                sensor: 'ไข่ใบเล็ก เปลือกสวยและไม่แตก', feedback: 'ไข่เล็กไม่แตกควรเข้ามาตรฐาน',
                isDecoy: true, decoyReason: 'ไข่ใบนี้เปลือกสวยมาก แต่ขนาดเล็ก จึงเข้าถาดมาตรฐาน ไม่ใช่พรีเมียม',
                properties: ['ขนาด: เล็ก', 'เปลือก: สวยและไม่แตก', 'สถานะ: มาตรฐาน'], hint: 'เปลือกสวยอย่างเดียวไม่ทำให้เป็นพรีเมียม'
            },
            dark_small_decoy: {
                label: 'ไข่สีเข้มแต่ไม่ได้ร้าว', props: { type: 'egg', size: 'small', shell: 'perfect', color: 'dark' }, expectedAction: 'standard_tray',
                sensor: 'ไข่สีเข้มตามธรรมชาติ แต่ไม่พบรอยร้าว', feedback: 'สีเข้มไม่ใช่รอยร้าว',
                isDecoy: true, decoyReason: 'ไข่สีเข้มแต่ไม่ได้ร้าว ถ้าเป็นไข่ใบเล็กไม่แตกควรเข้าถาดมาตรฐาน',
                properties: ['ขนาด: เล็ก', 'สี: เข้มตามธรรมชาติ', 'เปลือก: ไม่ร้าว'], hint: 'อย่าสับสนสีเปลือกกับรอยร้าว'
            },
            shadow_large_decoy: {
                label: 'ไข่ใหญ่มีเงาคล้ายรอยร้าว', props: { type: 'egg', size: 'large', shell: 'perfect', color: 'normal', shadow: true }, expectedAction: 'premium_tray',
                sensor: 'เห็นเงาสะท้อน แต่เปลือกไม่ร้าว', feedback: 'เงาไม่ใช่รอยร้าว ไข่ใหญ่ยังเป็นพรีเมียม',
                isDecoy: true, decoyReason: 'ไข่ใบนี้มีเงาสะท้อนคล้ายรอยร้าว แต่เปลือกสมบูรณ์ จึงควรเข้าถาดพรีเมียม',
                properties: ['ขนาด: ใหญ่', 'รอยที่เห็น: เงาสะท้อน', 'เปลือก: สมบูรณ์'], hint: 'ตรวจว่าเป็นรอยร้าวจริงหรือแค่เงา'
            }
        }[variant];
        return makeItem({ id: `egg_${variant}_${id}`, key: `egg_${variant}`, icon: '🥚', inspect: inspect(data, 'ตัวหลอก: ต้องดูทั้งขนาดและสภาพเปลือก'), ...data });
    }

    function wool(id, variant) {
        const data = {
            clean_soft: {
                label: 'ขนแกะสะอาดและนุ่ม', props: { type: 'wool', clean: true, soft: true, hasGrass: false, wet: false }, expectedAction: 'premium_yarn',
                sensor: 'ขนแกะสะอาด นุ่ม และฟูพอดี', feedback: 'ขนแกะสะอาดและนุ่มควรเป็นไหมพรมพรีเมียม',
                properties: ['ความสะอาด: สะอาด', 'ความนุ่ม: นุ่ม', 'เศษหญ้า: ไม่มี'], hint: 'ถ้าสะอาดและนุ่ม เข้า If แรก'
            },
            grass: {
                label: 'ขนแกะมีเศษหญ้า', props: { type: 'wool', clean: false, soft: true, hasGrass: true, wet: false }, expectedAction: 'cleaning_machine',
                sensor: 'พบเศษหญ้าติดอยู่ในขนแกะ', feedback: 'ขนแกะมีเศษหญ้าควรเข้าเครื่องทำความสะอาด',
                properties: ['เศษหญ้า: มี', 'ความนุ่ม: ยังพอใช้', 'สถานะ: ต้องทำความสะอาด'], hint: 'ไม่เข้า If แรก แต่เข้า Else If'
            },
            wet_dirty: {
                label: 'ขนแกะเปียกและสกปรกมาก', props: { type: 'wool', clean: false, soft: false, hasGrass: false, wet: true }, expectedAction: 'recycle_bin',
                sensor: 'ขนแกะเปียกและสกปรกมาก', feedback: 'ขนแกะเสียควรเข้าถังรีไซเคิล',
                properties: ['ความสะอาด: สกปรกมาก', 'ความนุ่ม: ไม่ผ่าน', 'สถานะ: รีไซเคิล'], hint: 'ไม่เข้า If หรือ Else If จึงใช้ Else'
            },
            clean_not_fluffy_decoy: {
                label: 'ขนแกะสะอาดแต่ไม่ฟู', props: { type: 'wool', clean: true, soft: false, hasGrass: false, wet: false }, expectedAction: 'recycle_bin',
                sensor: 'สะอาดแต่เนื้อขนไม่ฟูและไม่นุ่ม', feedback: 'สะอาดอย่างเดียวไม่พอสำหรับพรีเมียม',
                isDecoy: true, decoyReason: 'ขนแกะสะอาดแต่ไม่ฟูไม่นุ่ม จึงยังไม่ควรเป็นไหมพรมพรีเมียม',
                properties: ['ความสะอาด: สะอาด', 'ความนุ่ม: ไม่ผ่าน', 'เศษหญ้า: ไม่มี'], hint: 'พรีเมียมต้องสะอาดและนุ่ม'
            },
            tiny_grass_decoy: {
                label: 'ขนแกะมีเศษหญ้าน้อยมาก', props: { type: 'wool', clean: false, soft: true, hasGrass: true, wet: false }, expectedAction: 'cleaning_machine',
                sensor: 'พบเศษหญ้าน้อยมากแต่ยังมีอยู่', feedback: 'มีเศษหญ้าแม้น้อยก็ควรทำความสะอาด',
                isDecoy: true, decoyReason: 'ขนแกะมีเศษหญ้าน้อยมาก แต่ยังเข้าเงื่อนไขมีเศษหญ้า จึงควรส่งไปเครื่องทำความสะอาด',
                properties: ['เศษหญ้า: มีเล็กน้อย', 'ความนุ่ม: พอใช้', 'สถานะ: ต้องทำความสะอาด'], hint: 'คำว่าเล็กน้อยยังหมายถึงมีเศษหญ้า'
            },
            dark_natural_decoy: {
                label: 'ขนแกะสีเข้มตามธรรมชาติ', props: { type: 'wool', clean: true, soft: true, hasGrass: false, wet: false, color: 'dark' }, expectedAction: 'premium_yarn',
                sensor: 'สีเข้มตามธรรมชาติ แต่ขนสะอาดและนุ่ม', feedback: 'สีเข้มไม่ใช่ความสกปรก',
                isDecoy: true, decoyReason: 'ขนแกะสีเข้มตามธรรมชาติแต่สะอาดและนุ่ม จึงควรเป็นไหมพรมพรีเมียม',
                properties: ['สี: เข้มตามธรรมชาติ', 'ความสะอาด: สะอาด', 'ความนุ่ม: นุ่ม'], hint: 'แยกสีตามธรรมชาติออกจากคราบสกปรก'
            },
            fluffy_wet_decoy: {
                label: 'ขนแกะฟูแต่มีคราบน้ำ', props: { type: 'wool', clean: false, soft: true, hasGrass: false, wet: true }, expectedAction: 'recycle_bin',
                sensor: 'ขนฟูแต่มีคราบน้ำและไม่สะอาด', feedback: 'ฟูอย่างเดียวไม่พอถ้าสกปรกหรือเปียก',
                isDecoy: true, decoyReason: 'ขนแกะฟูแต่มีคราบน้ำ ไม่สะอาด จึงไม่ควรเป็นไหมพรมพรีเมียม',
                properties: ['ความฟู: มี', 'คราบน้ำ: มี', 'ความสะอาด: ไม่ผ่าน'], hint: 'ดูความสะอาดควบคู่กับความนุ่ม'
            }
        }[variant];
        return makeItem({ id: `wool_${variant}_${id}`, key: `wool_${variant}`, icon: '🐑', inspect: inspect(data, 'ตัวหลอก: ต้องอ่านความสะอาด เศษหญ้า และความนุ่มตามลำดับ'), ...data });
    }

    function milk(id, temperature, variant) {
        let expectedAction = 'discard_milk';
        let feedback = `นม ${temperature}°C สูงกว่า 15°C ควรคัดทิ้ง`;
        if (temperature < 8) {
            expectedAction = 'bottle_ready';
            feedback = `นม ${temperature}°C ต่ำกว่า 8°C ควรบรรจุขวดพร้อมขาย`;
        } else if (temperature >= 8 && temperature <= 15) {
            expectedAction = 'cooling_room';
            feedback = `นม ${temperature}°C อยู่ช่วง 8-15°C ควรเข้าห้องทำความเย็น`;
        }
        const decoyText = {
            edge_good_decoy: 'นม 7.9°C ต่ำกว่า 8°C แม้ใกล้ขอบเขต จึงควรบรรจุขวดพร้อมขาย',
            edge_cool_decoy: `นม ${temperature}°C อยู่ในช่วง 8-15°C พอดี จึงควรเข้าห้องทำความเย็น`,
            edge_hot_decoy: 'นม 15.1°C สูงกว่า 15°C แล้ว จึงควรคัดทิ้ง',
            pretty_label_decoy: 'ขวดนมฉลากสวย แต่คุณภาพตัดสินจากอุณหภูมิ ไม่ใช่ฉลาก',
            fancy_bottle_decoy: 'ขวดนมสวย แต่ตัวเลขอุณหภูมิต่ำกว่า 8°C จึงควรบรรจุขวดพร้อมขาย'
        }[variant] || '';
        const isDecoy = Boolean(decoyText);
        const label = labelForMilk(temperature, variant);
        return makeItem({
            id: `milk_${String(temperature).replace('.', '_')}_${id}`,
            key: `milk_${variant}_${String(temperature).replace('.', '_')}`,
            label,
            icon: '🥛',
            props: { type: 'milk', temperature, labelStyle: variant },
            expectedAction,
            sensor: `เครื่องวัดอุณหภูมิอ่านค่า ${temperature}°C`,
            feedback,
            isDecoy,
            decoyReason: decoyText,
            inspect: {
                title: label,
                properties: ['ชนิด: น้ำนม', `อุณหภูมิ: ${temperature}°C`, `เกณฑ์: ${temperature < 8 ? 'ต่ำกว่า 8°C' : temperature <= 15 ? '8-15°C' : 'สูงกว่า 15°C'}`],
                hint: 'ใช้ตัวเลขอุณหภูมิเป็นหลัก โดย 8°C และ 15°C รวมอยู่ในช่วงทำความเย็น',
                warning: isDecoy ? 'ตัวหลอก: ระวังค่าขอบเขตและอย่าตัดสินจากฉลาก' : ''
            }
        });
    }

    function labelForMilk(temperature, variant) {
        const labels = {
            cold: `นมเย็นคุณภาพดี ${temperature}°C`,
            cool: `นมต้องทำความเย็น ${temperature}°C`,
            hot: `นมอุณหภูมิสูง ${temperature}°C`,
            edge_good_decoy: 'นม 7.9°C ใกล้ขอบเขต',
            edge_cool_decoy: `นม ${temperature}°C พอดี`,
            edge_hot_decoy: 'นม 15.1°C ใกล้ขอบเขต',
            pretty_label_decoy: `นมฉลากสวย ${temperature}°C`,
            fancy_bottle_decoy: `ขวดนมสีสวย ${temperature}°C`
        };
        return labels[variant] || `นม ${temperature}°C`;
    }

    function boot() {
        window.FarmMissions.conveyorLogic(config);
    }

    if (window.FarmMissions && window.FarmMissions.conveyorLogic) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/conveyor_logic_base.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
