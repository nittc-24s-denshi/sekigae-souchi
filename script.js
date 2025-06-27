// 席替えメーカー JavaScript

class SeatingArranger {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSampleData();
    } initializeElements() {
        this.rowsInput = document.getElementById('rows');
        this.colsInput = document.getElementById('cols');
        this.studentsTextarea = document.getElementById('students');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.exportCsvBtn = document.getElementById('export-csv-btn');
        this.exportImageBtn = document.getElementById('export-image-btn');
        this.seatingChart = document.getElementById('seating-chart');
        this.toast = document.getElementById('toast');
        this.columnConstraints = document.getElementById('column-constraints');
        this.addConstraintBtn = document.getElementById('add-constraint-btn');
        this.fixedSeats = document.getElementById('fixed-seats');
        this.addFixedSeatBtn = document.getElementById('add-fixed-seat-btn'); this.rowConstraintsContainer = document.getElementById('row-constraints');
        this.addRowConstraintBtn = document.getElementById('add-row-constraint-btn');
        this.toggleSettingsBtn = document.getElementById('toggle-settings-btn');
        this.configPanel = document.getElementById('config-panel');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        this.loadSettingsBtn = document.getElementById('load-settings-btn');
        this.settingsFile = document.getElementById('settings-file');
        this.importCsvBtn = document.getElementById('import-csv-btn');
        this.csvFile = document.getElementById('csv-file');

        // 制約データを管理する配列
        this.constraints = [];
        this.fixedSeatConstraints = [];
        this.rowConstraintsData = [];

        // ドラッグ&ドロップの状態管理
        this.draggedElement = null;
        this.draggedStudent = null;
    } bindEvents() {
        this.shuffleBtn.addEventListener('click', () => this.shuffleSeats());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.exportBtn.addEventListener('click', () => this.exportSeatingChart());
        this.exportCsvBtn.addEventListener('click', () => this.exportToCSV());
        this.exportImageBtn.addEventListener('click', () => this.exportToImage());
        this.addConstraintBtn.addEventListener('click', () => this.addConstraint());
        this.addFixedSeatBtn.addEventListener('click', () => this.addFixedSeat());
        this.addRowConstraintBtn.addEventListener('click', () => this.addRowConstraint());
        this.toggleSettingsBtn.addEventListener('click', () => this.toggleSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.loadSettingsBtn.addEventListener('click', () => this.loadSettings());
        this.settingsFile.addEventListener('change', (e) => this.handleFileLoad(e));
        this.importCsvBtn.addEventListener('click', () => this.importCsv());
        this.csvFile.addEventListener('change', (e) => this.handleCsvLoad(e));

        // 生徒リストが変更された時にプルダウンを更新
        this.studentsTextarea.addEventListener('input', () => this.updateStudentSelects());

        // 行数・列数が変更された時に入力フィールドの範囲を更新
        this.rowsInput.addEventListener('input', () => this.updateInputRanges());
        this.colsInput.addEventListener('input', () => this.updateInputRanges());
    }

    loadSampleData() {
        const sampleStudents = [
            '田中太郎', '佐藤花子', '山田次郎', '鈴木美咲', '高橋健太',
            '渡辺あみ', '伊藤大輔', '中村みゆき', '小林拓也', '加藤さくら',
            '吉田翔太', '山本ゆい', '松本涼介', '井上なな', '木村陸斗',
            '林真央', '清水優太', '森さやか', '池田蓮', '橋本あかね',
            '山口直樹', '石川みさき', '斎藤颯真', '金子のぞみ', '藤田康太',
            '後藤りさ', '村上駿', '近藤ひな', '坂本翼', '遠藤あいり'
        ];

        this.studentsTextarea.value = sampleStudents.join('\n');
    }

    shuffleSeats() {
        const rows = parseInt(this.rowsInput.value);
        const cols = parseInt(this.colsInput.value);
        const studentsText = this.studentsTextarea.value.trim();

        // バリデーション
        if (!this.validateInput(rows, cols, studentsText)) {
            return;
        } const students = studentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        // 制約を考慮して生徒を配置
        const arrangedStudents = this.arrangeStudentsWithConstraints(rows, cols, students);

        // 座席表を生成
        this.generateSeatingChart(rows, cols, arrangedStudents);

        // エクスポートボタンを表示
        this.exportBtn.style.display = 'block';

        this.showToast('席替えが完了しました！', 'success');
    }

    validateInput(rows, cols, studentsText) {
        if (rows < 1 || rows > 10) {
            this.showToast('行数は1〜10の範囲で入力してください', 'error');
            return false;
        }

        if (cols < 1 || cols > 10) {
            this.showToast('列数は1〜10の範囲で入力してください', 'error');
            return false;
        }

        if (!studentsText) {
            this.showToast('生徒名を入力してください', 'error');
            return false;
        }

        const studentCount = studentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0).length;

        if (studentCount > rows * cols) {
            this.showToast(`座席数（${rows * cols}席）より生徒数（${studentCount}人）が多すぎます`, 'error');
            return false;
        }

        return true;
    }

    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }    // 制約追加機能
    addConstraint() {
        const constraintId = Date.now().toString();
        const constraintItem = document.createElement('div');
        constraintItem.className = 'constraint-item';
        constraintItem.dataset.constraintId = constraintId;

        const studentsText = this.studentsTextarea.value.trim();
        const students = studentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        const cols = parseInt(this.colsInput.value);

        constraintItem.innerHTML = `
            <select class="student-select">
                <option value="">生徒を選択</option>
                ${students.map(student => `<option value="${student}">${student}</option>`).join('')}
            </select>
            <span class="constraint-label">を</span>
            <input type="number" class="column-input" min="1" max="${cols}" placeholder="列">
            <span class="constraint-label">列目に配置</span>
            <button type="button" class="remove-constraint-btn" onclick="seatingArranger.removeConstraint('${constraintId}')">削除</button>
        `;

        this.columnConstraints.appendChild(constraintItem);

        // 生徒リストが空の場合は警告
        if (students.length === 0) {
            this.showToast('先に生徒名を入力してください', 'warning');
        }
    }

    // 制約削除機能
    removeConstraint(constraintId) {
        const constraintItem = document.querySelector(`[data-constraint-id="${constraintId}"]`);
        if (constraintItem) {
            constraintItem.remove();
        }
    }    // 固定席追加機能
    addFixedSeat() {
        const fixedSeatId = Date.now().toString();
        const fixedSeatItem = document.createElement('div');
        fixedSeatItem.className = 'fixed-seat-item';
        fixedSeatItem.dataset.fixedSeatId = fixedSeatId;

        const studentsText = this.studentsTextarea.value.trim();
        const students = studentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        const rows = parseInt(this.rowsInput.value);
        const cols = parseInt(this.colsInput.value);

        fixedSeatItem.innerHTML = `
            <select class="student-select">
                <option value="">生徒を選択</option>
                ${students.map(student => `<option value="${student}">${student}</option>`).join('')}
            </select>
            <span class="constraint-label">を</span>
            <input type="number" class="row-input" min="1" max="${rows}" placeholder="行">
            <span class="constraint-label">行</span>
            <input type="number" class="column-input" min="1" max="${cols}" placeholder="列">
            <span class="constraint-label">列に固定</span>
            <button type="button" class="remove-constraint-btn" onclick="seatingArranger.removeFixedSeat('${fixedSeatId}')">削除</button>
        `;

        this.fixedSeats.appendChild(fixedSeatItem);

        // 生徒リストが空の場合は警告
        if (students.length === 0) {
            this.showToast('先に生徒名を入力してください', 'warning');
        }
    }

    // 固定席削除機能
    removeFixedSeat(fixedSeatId) {
        const fixedSeatItem = document.querySelector(`[data-fixed-seat-id="${fixedSeatId}"]`);
        if (fixedSeatItem) {
            fixedSeatItem.remove();
        }
    }    // 行制約追加機能
    addRowConstraint() {
        if (!this.rowConstraintsContainer) {
            this.showToast('行制約設定エリアが見つかりません', 'error');
            return;
        }

        const rowConstraintId = Date.now().toString();
        const rowConstraintItem = document.createElement('div');
        rowConstraintItem.className = 'row-constraint-item';
        rowConstraintItem.dataset.rowConstraintId = rowConstraintId;

        const studentsText = this.studentsTextarea.value.trim();
        const students = studentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        const rows = parseInt(this.rowsInput.value);

        rowConstraintItem.innerHTML = `
            <select class="student-select">
                <option value="">生徒を選択</option>
                ${students.map(student => `<option value="${student}">${student}</option>`).join('')}
            </select>
            <span class="constraint-label">を</span>
            <input type="number" class="row-input" min="1" max="${rows}" placeholder="行">
            <span class="constraint-label">行目に配置</span>
            <button type="button" class="remove-constraint-btn" onclick="seatingArranger.removeRowConstraint('${rowConstraintId}')">削除</button>
        `;

        this.rowConstraintsContainer.appendChild(rowConstraintItem);

        // 生徒リストが空の場合は警告
        if (students.length === 0) {
            this.showToast('先に生徒名を入力してください', 'warning');
        }
    }

    // 行制約削除機能
    removeRowConstraint(rowConstraintId) {
        const rowConstraintItem = document.querySelector(`[data-row-constraint-id="${rowConstraintId}"]`);
        if (rowConstraintItem) {
            rowConstraintItem.remove();
        }
    }

    // 設定パネルの開閉
    toggleSettings() {
        this.configPanel.classList.toggle('collapsed');
        const isCollapsed = this.configPanel.classList.contains('collapsed');
        this.toggleSettingsBtn.textContent = isCollapsed ? '⚙️ 設定を開く' : '⚙️ 設定を閉じる';

        // レイアウトの調整
        const main = document.querySelector('main');
        if (isCollapsed) {
            main.style.gridTemplateColumns = '1fr';
        } else {
            main.style.gridTemplateColumns = '1fr 2fr';
        }
    }

    // 設定を保存
    saveSettings() {
        const settings = {
            rows: this.rowsInput.value,
            cols: this.colsInput.value,
            students: this.studentsTextarea.value,
            columnConstraints: this.getConstraints(),
            rowConstraints: this.getRowConstraints(),
            fixedSeatConstraints: this.getFixedSeatConstraints(),
            timestamp: new Date().toISOString()
        };

        // ローカルストレージに保存
        localStorage.setItem('seatingArrangerSettings', JSON.stringify(settings));

        // ファイルとしてダウンロード
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `席替え設定_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('設定を保存しました', 'success');
    }

    // 設定を読込
    loadSettings() {
        this.settingsFile.click();
    }

    // ファイル読込処理
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                this.applySettings(settings);
                this.showToast('設定を読み込みました', 'success');
            } catch (error) {
                this.showToast('設定ファイルの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 設定を適用
    applySettings(settings) {
        if (settings.rows) this.rowsInput.value = settings.rows;
        if (settings.cols) this.colsInput.value = settings.cols;
        if (settings.students) this.studentsTextarea.value = settings.students;        // 制約をクリア
        this.columnConstraints.innerHTML = '';
        this.rowConstraintsContainer.innerHTML = '';
        this.fixedSeats.innerHTML = '';

        // 列制約を復元
        if (settings.columnConstraints) {
            settings.columnConstraints.forEach(constraint => {
                this.addConstraint();
                const lastItem = this.columnConstraints.lastElementChild;
                lastItem.querySelector('.student-select').value = constraint.student;
                lastItem.querySelector('.column-input').value = constraint.column;
            });
        }        // 行制約を復元
        if (settings.rowConstraints) {
            settings.rowConstraints.forEach(constraint => {
                this.addRowConstraint();
                const lastItem = this.rowConstraintsContainer.lastElementChild;
                lastItem.querySelector('.student-select').value = constraint.student;
                lastItem.querySelector('.row-input').value = constraint.row;
            });
        }

        // 固定席を復元
        if (settings.fixedSeatConstraints) {
            settings.fixedSeatConstraints.forEach(constraint => {
                this.addFixedSeat();
                const lastItem = this.fixedSeats.lastElementChild;
                lastItem.querySelector('.student-select').value = constraint.student;
                lastItem.querySelector('.row-input').value = constraint.row;
                lastItem.querySelector('.column-input').value = constraint.column;
            });
        }

        this.updateInputRanges();
    }
    // 制約を考慮した生徒配置
    arrangeStudentsWithConstraints(rows, cols, students) {
        const totalSeats = rows * cols;
        const result = new Array(totalSeats).fill(null);
        const availableStudents = [...students];        // 制約を取得
        const constraints = this.getConstraints();
        const fixedSeatConstraints = this.getFixedSeatConstraints();
        const rowConstraints = this.getRowConstraints();

        // 制約違反チェック
        if (!this.validateConstraints(constraints, cols, students) ||
            !this.validateFixedSeatConstraints(fixedSeatConstraints, rows, cols, students) ||
            !this.validateRowConstraints(rowConstraints, rows, students)) {
            return this.shuffleArray(students); // 制約に問題がある場合は通常のシャッフル
        }

        // 固定席のある生徒を最初に配置
        for (const fixedConstraint of fixedSeatConstraints) {
            const { student, row, column } = fixedConstraint;
            const studentIndex = availableStudents.indexOf(student);

            if (studentIndex !== -1) {
                const seatIndex = (row - 1) * cols + (column - 1);
                if (result[seatIndex] === null) {
                    result[seatIndex] = student;
                    availableStudents.splice(studentIndex, 1);
                }
            }
        }

        // 行制約のある生徒を次に配置
        for (const rowConstraint of rowConstraints) {
            const { student, row } = rowConstraint;
            const studentIndex = availableStudents.indexOf(student);

            if (studentIndex !== -1) {
                // 指定された行の空いている席を探す
                const availableSeatsInRow = [];
                for (let col = 0; col < cols; col++) {
                    const seatIndex = (row - 1) * cols + col;
                    if (result[seatIndex] === null) {
                        availableSeatsInRow.push(seatIndex);
                    }
                }

                if (availableSeatsInRow.length > 0) {
                    // ランダムに席を選択
                    const randomSeatIndex = availableSeatsInRow[Math.floor(Math.random() * availableSeatsInRow.length)];
                    result[randomSeatIndex] = student;
                    availableStudents.splice(studentIndex, 1);
                }
            }
        }

        // 列制約のある生徒を次に配置
        for (const constraint of constraints) {
            const { student, column } = constraint;
            const studentIndex = availableStudents.indexOf(student);

            if (studentIndex !== -1) {
                // 指定された列の空いている席を探す
                const availableSeatsInColumn = [];
                for (let row = 0; row < rows; row++) {
                    const seatIndex = row * cols + (column - 1);
                    if (result[seatIndex] === null) {
                        availableSeatsInColumn.push(seatIndex);
                    }
                }

                if (availableSeatsInColumn.length > 0) {
                    // ランダムに席を選択
                    const randomSeatIndex = availableSeatsInColumn[Math.floor(Math.random() * availableSeatsInColumn.length)];
                    result[randomSeatIndex] = student;
                    availableStudents.splice(studentIndex, 1);
                }
            }
        }

        // 残りの生徒をランダムに配置
        const shuffledRemaining = this.shuffleArray(availableStudents);
        let remainingIndex = 0;

        for (let i = 0; i < totalSeats && remainingIndex < shuffledRemaining.length; i++) {
            if (result[i] === null) {
                result[i] = shuffledRemaining[remainingIndex];
                remainingIndex++;
            }
        }

        return result.filter(student => student !== null);
    }    // 制約を取得
    getConstraints() {
        const constraints = [];
        if (!this.columnConstraints) {
            console.warn('column-constraints element not found');
            return constraints;
        }

        const constraintItems = this.columnConstraints.querySelectorAll('.constraint-item');

        constraintItems.forEach(item => {
            const studentSelect = item.querySelector('.student-select');
            const columnInput = item.querySelector('.column-input');

            const student = studentSelect?.value?.trim();
            const column = parseInt(columnInput?.value);

            if (student && column) {
                constraints.push({ student, column });
            }
        });

        return constraints;
    }    // 固定席制約を取得
    getFixedSeatConstraints() {
        const fixedConstraints = [];
        if (!this.fixedSeats) {
            console.warn('fixed-seats element not found');
            return fixedConstraints;
        }

        const fixedSeatItems = this.fixedSeats.querySelectorAll('.fixed-seat-item');

        fixedSeatItems.forEach(item => {
            const studentSelect = item.querySelector('.student-select');
            const rowInput = item.querySelector('.row-input');
            const columnInput = item.querySelector('.column-input');

            const student = studentSelect?.value?.trim();
            const row = parseInt(rowInput?.value);
            const column = parseInt(columnInput?.value);

            if (student && row && column) {
                fixedConstraints.push({ student, row, column });
            }
        });

        return fixedConstraints;
    }    // 行制約を取得
    getRowConstraints() {
        const rowConstraints = [];
        if (!this.rowConstraintsContainer) {
            console.warn('row-constraints element not found');
            return rowConstraints;
        }

        const rowConstraintItems = this.rowConstraintsContainer.querySelectorAll('.row-constraint-item');

        rowConstraintItems.forEach(item => {
            const studentSelect = item.querySelector('.student-select');
            const rowInput = item.querySelector('.row-input');

            const student = studentSelect?.value?.trim();
            const row = parseInt(rowInput?.value);

            if (student && row) {
                rowConstraints.push({ student, row });
            }
        });

        return rowConstraints;
    }

    // 制約のバリデーション
    validateConstraints(constraints, cols, students) {
        for (const constraint of constraints) {
            // 列番号チェック
            if (constraint.column < 1 || constraint.column > cols) {
                this.showToast(`列番号は1〜${cols}の範囲で指定してください`, 'error');
                return false;
            }

            // 生徒名チェック
            if (!students.includes(constraint.student)) {
                this.showToast(`制約に指定された「${constraint.student}」が生徒リストにありません`, 'error');
                return false;
            }
        }

        // 同じ生徒が複数の制約に含まれていないかチェック
        const studentSet = new Set();
        for (const constraint of constraints) {
            if (studentSet.has(constraint.student)) {
                this.showToast(`「${constraint.student}」が複数の制約に指定されています`, 'error');
                return false;
            }
            studentSet.add(constraint.student);
        }

        return true;
    }

    // 固定席制約のバリデーション
    validateFixedSeatConstraints(fixedConstraints, rows, cols, students) {
        const occupiedSeats = new Set();

        for (const constraint of fixedConstraints) {
            // 行番号チェック
            if (constraint.row < 1 || constraint.row > rows) {
                this.showToast(`行番号は1〜${rows}の範囲で指定してください`, 'error');
                return false;
            }

            // 列番号チェック
            if (constraint.column < 1 || constraint.column > cols) {
                this.showToast(`列番号は1〜${cols}の範囲で指定してください`, 'error');
                return false;
            }

            // 生徒名チェック
            if (!students.includes(constraint.student)) {
                this.showToast(`固定席に指定された「${constraint.student}」が生徒リストにありません`, 'error');
                return false;
            }

            // 席の重複チェック
            const seatKey = `${constraint.row}-${constraint.column}`;
            if (occupiedSeats.has(seatKey)) {
                this.showToast(`${constraint.row}行${constraint.column}列が複数の固定席に指定されています`, 'error');
                return false;
            }
            occupiedSeats.add(seatKey);
        }

        // 同じ生徒が複数の固定席に指定されていないかチェック
        const studentSet = new Set();
        for (const constraint of fixedConstraints) {
            if (studentSet.has(constraint.student)) {
                this.showToast(`「${constraint.student}」が複数の固定席に指定されています`, 'error');
                return false;
            }
            studentSet.add(constraint.student);
        }

        return true;
    }

    // 行制約のバリデーション
    validateRowConstraints(rowConstraints, rows, students) {
        for (const constraint of rowConstraints) {
            // 行番号チェック
            if (constraint.row < 1 || constraint.row > rows) {
                this.showToast(`行番号は1〜${rows}の範囲で指定してください`, 'error');
                return false;
            }

            // 生徒名チェック
            if (!students.includes(constraint.student)) {
                this.showToast(`行制約に指定された「${constraint.student}」が生徒リストにありません`, 'error');
                return false;
            }
        }

        // 同じ生徒が複数の行制約に含まれていないかチェック
        const studentSet = new Set();
        for (const constraint of rowConstraints) {
            if (studentSet.has(constraint.student)) {
                this.showToast(`「${constraint.student}」が複数の行制約に指定されています`, 'error');
                return false;
            }
            studentSet.add(constraint.student);
        }

        return true;
    } generateSeatingChart(rows, cols, students) {
        this.seatingChart.innerHTML = '';

        const deskGrid = document.createElement('div');
        deskGrid.className = 'desk-grid';
        deskGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        deskGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // 固定席制約を取得
        const fixedSeatConstraints = this.getFixedSeatConstraints();
        const fixedSeatMap = new Map();

        fixedSeatConstraints.forEach(constraint => {
            const seatIndex = (constraint.row - 1) * cols + (constraint.column - 1);
            fixedSeatMap.set(seatIndex, constraint.student);
        });

        // 固定席に配置された生徒を除外したstudents配列を作成
        const fixedStudents = new Set(fixedSeatConstraints.map(c => c.student));
        const availableStudents = students.filter(student => !fixedStudents.has(student));

        let studentIndex = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const desk = document.createElement('div');
                desk.className = 'desk';
                const currentSeatIndex = row * cols + col;                // 固定席かどうかをチェック
                if (fixedSeatMap.has(currentSeatIndex)) {
                    desk.textContent = fixedSeatMap.get(currentSeatIndex);
                    desk.className += ' fixed-seat';
                    desk.title = `固定席: ${row + 1}行${col + 1}列 - ${fixedSeatMap.get(currentSeatIndex)}`;
                } else if (studentIndex < availableStudents.length) {
                    desk.textContent = availableStudents[studentIndex];
                    desk.title = `座席: ${row + 1}行${col + 1}列`;
                    desk.className += ' draggable';
                    studentIndex++;
                } else {
                    desk.textContent = '空席';
                    desk.className += ' empty';
                    desk.title = `空席: ${row + 1}行${col + 1}列`;
                }

                // ドラッグ&ドロップのイベントリスナーを追加
                this.addDragAndDropListeners(desk);

                deskGrid.appendChild(desk);
            }
        }

        this.seatingChart.appendChild(deskGrid);

        // エクスポートボタンを表示
        this.exportBtn.style.display = 'block';
        this.exportCsvBtn.style.display = 'block';
        this.exportImageBtn.style.display = 'block';
    }

    // ドラッグ&ドロップのイベントリスナーを追加
    addDragAndDropListeners(desk) {
        if (desk.classList.contains('draggable') && desk.textContent !== '空席') {
            desk.draggable = true;

            desk.addEventListener('dragstart', (e) => {
                this.draggedElement = desk;
                this.draggedStudent = desk.textContent;
                desk.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            desk.addEventListener('dragend', () => {
                desk.classList.remove('dragging');
                this.draggedElement = null;
                this.draggedStudent = null;
                // すべてのドロップターゲットクラスを削除
                document.querySelectorAll('.drop-target, .drop-active').forEach(el => {
                    el.classList.remove('drop-target', 'drop-active');
                });
            });
        }

        // すべての席にドロップ機能を追加
        desk.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedElement && this.draggedElement !== desk) {
                desk.classList.add('drop-target');
            }
        });

        desk.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (this.draggedElement && this.draggedElement !== desk) {
                desk.classList.add('drop-active');
            }
        });

        desk.addEventListener('dragleave', () => {
            desk.classList.remove('drop-target', 'drop-active');
        });

        desk.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedElement && this.draggedElement !== desk) {
                this.handleDrop(this.draggedElement, desk);
            }
            desk.classList.remove('drop-target', 'drop-active');
        });
    }

    // ドロップ処理
    handleDrop(sourceDesk, targetDesk) {
        // 固定席へのドロップは禁止
        if (targetDesk.classList.contains('fixed-seat')) {
            this.showToast('固定席には移動できません', 'warning');
            return;
        }

        // 席の交換
        const sourceStudent = sourceDesk.textContent;
        const targetStudent = targetDesk.textContent;

        sourceDesk.textContent = targetStudent;
        targetDesk.textContent = sourceStudent;

        // クラスの更新
        if (targetStudent === '空席') {
            sourceDesk.classList.add('empty');
            sourceDesk.classList.remove('draggable');
            sourceDesk.draggable = false;
        } else {
            sourceDesk.classList.remove('empty');
            sourceDesk.classList.add('draggable');
            sourceDesk.draggable = true;
        }

        if (sourceStudent !== '空席') {
            targetDesk.classList.remove('empty');
            targetDesk.classList.add('draggable');
            targetDesk.draggable = true;
        }

        this.showToast('座席を移動しました', 'success');
    }

    // CSV出力
    exportToCSV() {
        const rows = parseInt(this.rowsInput.value);
        const cols = parseInt(this.colsInput.value);
        const desks = this.seatingChart.querySelectorAll('.desk');

        if (desks.length === 0) {
            this.showToast('座席表が生成されていません', 'error');
            return;
        }

        let csvContent = '';
        let deskIndex = 0;

        for (let row = 0; row < rows; row++) {
            const rowData = [];
            for (let col = 0; col < cols; col++) {
                const desk = desks[deskIndex];
                rowData.push(`"${desk.textContent}"`);
                deskIndex++;
            }
            csvContent += rowData.join(',') + '\n';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `座席表_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('CSVファイルをダウンロードしました', 'success');
    }

    // 画像出力
    exportToImage() {
        const seatingChart = this.seatingChart;

        // html2canvasライブラリが必要ですが、代替手段としてSVGを使用
        this.showToast('画像出力機能は開発中です', 'info');
    }    // CSVインポート
    importCsv() {
        console.log('CSVインポートボタンがクリックされました');
        console.log('csvFile要素:', this.csvFile);

        // テスト用のCSVデータをコンソールに出力
        console.log('対応CSVフォーマット:');
        console.log('1. 標準形式:');
        console.log('行,列,生徒名');
        console.log('1,1,田中太郎');
        console.log('1,2,佐藤花子');
        console.log('2. マトリックス形式:');
        console.log('"生徒1","生徒2","生徒3"');
        console.log('"生徒4","","生徒5"'); // 空欄は空席

        if (this.csvFile) {
            this.csvFile.click();
        } else {
            console.error('csvFile要素が見つかりません');
            this.showToast('ファイル選択機能が利用できません', 'error');
        }
    }

    // CSVファイル読み込み処理
    handleCsvLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                console.log('読み込んだCSVデータ:', csvText); // デバッグ用
                this.parseCsvAndApply(csvText);
                this.showToast('CSVファイルを読み込みました', 'success');
            } catch (error) {
                console.error('CSV読み込みエラー:', error);
                this.showToast('CSVファイルの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file, 'UTF-8');

        // ファイル選択をリセット（同じファイルを再選択できるようにする）
        event.target.value = '';
    }    // CSV解析と座席表への適用
    parseCsvAndApply(csvText) {
        console.log('CSVテキストの解析を開始:', csvText);
        const lines = csvText.trim().split('\n');
        console.log('解析した行数:', lines.length);

        if (lines.length === 0) {
            this.showToast('CSVファイルが空です', 'error');
            return;
        }

        // まず、マトリックス形式（各行が座席行、各列が座席列）かチェック
        const firstLine = this.parseCsvLine(lines[0]);
        console.log('最初の行の列数:', firstLine.length);

        // マトリックス形式の場合（列数が多く、数値でない場合）
        if (firstLine.length > 3 && !firstLine.every(cell => /^\d+$/.test(cell.trim()))) {
            console.log('マトリックス形式のCSVとして解析します');
            this.parseMatrixCsv(lines);
            return;
        }

        // 従来の形式（行,列,生徒名）の場合
        console.log('標準形式のCSVとして解析します');
        this.parseStandardCsv(lines);
    }

    // マトリックス形式のCSV解析
    parseMatrixCsv(lines) {
        const seats = [];
        let maxRow = 0;
        let maxCol = 0;

        lines.forEach((line, rowIndex) => {
            if (!line.trim()) return; // 空行をスキップ

            const columns = this.parseCsvLine(line);
            console.log(`${rowIndex + 1}行目の解析:`, columns);

            columns.forEach((cell, colIndex) => {
                const student = cell.trim();
                // 空のセルのみをスキップ
                if (student && student !== '') {
                    const row = rowIndex + 1;
                    const col = colIndex + 1;
                    seats.push({ row, col, student });
                    maxRow = Math.max(maxRow, row);
                    maxCol = Math.max(maxCol, col);
                    console.log(`座席データ追加: ${student} -> ${row}行${col}列`);
                }
            });
        });

        console.log('解析完了。座席データ数:', seats.length);
        console.log('最大行数:', maxRow, '最大列数:', maxCol);

        if (seats.length === 0) {
            this.showToast('有効な座席データが見つかりませんでした', 'error');
            return;
        }

        this.applySeatData(seats, maxRow, maxCol);
    }

    // 標準形式のCSV解析（行,列,生徒名）
    parseStandardCsv(lines) {
        // ヘッダー行をスキップ（必要に応じて）
        let dataLines = lines;
        if (lines[0] && lines[0].includes('行') && lines[0].includes('列')) {
            console.log('ヘッダー行を検出、スキップします');
            dataLines = lines.slice(1);
        }
        console.log('データ行数:', dataLines.length);

        const seats = [];
        let maxRow = 1; // 最小値を1に設定
        let maxCol = 1; // 最小値を1に設定

        // CSVデータを解析
        dataLines.forEach((line, index) => {
            if (!line.trim()) return; // 空行をスキップ

            const columns = this.parseCsvLine(line);
            console.log(`${index + 1}行目の解析結果:`, columns);

            if (columns.length >= 3) {
                const row = parseInt(columns[0]);
                const col = parseInt(columns[1]);
                const student = columns[2].trim();

                console.log(`解析データ: 行=${row}, 列=${col}, 生徒=${student}`);

                if (!isNaN(row) && !isNaN(col) && student && row > 0 && col > 0) {
                    seats.push({ row, col, student });
                    maxRow = Math.max(maxRow, row);
                    maxCol = Math.max(maxCol, col);
                    console.log(`有効なデータとして追加: row=${row}, col=${col}, student=${student}`);
                } else {
                    console.warn(`CSVの${index + 1}行目のデータが無効です:`, line);
                }
            } else {
                console.warn(`CSVの${index + 1}行目の列数が不足しています:`, line);
            }
        });

        console.log('解析完了。座席データ数:', seats.length);
        console.log('最大行数:', maxRow, '最大列数:', maxCol);

        if (seats.length === 0) {
            this.showToast('有効な座席データが見つかりませんでした', 'error');
            return;
        }

        this.applySeatData(seats, maxRow, maxCol);
    }

    // 座席データを適用
    applySeatData(seats, maxRow, maxCol) {
        // 行数・列数を設定
        console.log('行数・列数を設定中...');
        this.rowsInput.value = maxRow;
        this.colsInput.value = maxCol;
        console.log('設定完了: 行数=', this.rowsInput.value, '列数=', this.colsInput.value);

        // 入力フィールドの範囲を更新
        console.log('入力フィールドの範囲を更新中...');
        this.updateInputRanges();

        // 座席表を生成
        const totalSeats = maxRow * maxCol;
        const arrangedStudents = new Array(totalSeats).fill(null);
        console.log('座席表配列を作成:', totalSeats, '席');

        // CSVデータから座席表を構築
        console.log('座席表を構築中...');
        seats.forEach(({ row, col, student }) => {
            const seatIndex = (row - 1) * maxCol + (col - 1);
            if (seatIndex >= 0 && seatIndex < totalSeats) {
                arrangedStudents[seatIndex] = student;
                console.log(`座席配置: ${student} -> 位置${seatIndex} (${row}行${col}列)`);
            }
        });

        // 生徒一覧を更新（重複を排除）
        const allStudents = [...new Set(seats.map(seat => seat.student))];
        console.log('生徒一覧を更新:', allStudents);
        this.studentsTextarea.value = allStudents.join('\n');

        // プルダウンを更新
        console.log('プルダウンを更新中...');
        this.updateStudentSelects();

        // 座席表を表示
        console.log('座席表を生成中...');
        this.generateSeatingChart(maxRow, maxCol, arrangedStudents);

        // エクスポートボタンを表示
        this.exportBtn.style.display = 'block';
        this.exportCsvBtn.style.display = 'block';
        this.exportImageBtn.style.display = 'block';

        console.log('CSVインポート完了');
    }

    // CSV行を解析（カンマ区切り、クォート対応）
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // エスケープされたクォート
                    current += '"';
                    i++; // 次の文字をスキップ
                } else {
                    // クォートの開始/終了
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // 区切り文字
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        // 最後の項目を追加
        result.push(current);

        return result;
    }

    // トーストメッセージを表示
    showToast(message, type = 'info') {
        if (!this.toast) return;

        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;

        // 3秒後に自動的に非表示
        setTimeout(() => {
            this.toast.className = `toast ${type}`;
            setTimeout(() => {
                this.toast.style.display = 'none';
            }, 300); // アニメーション完了を待つ
        }, 3000);
    }

    // 生徒選択プルダウンを更新
    updateStudentSelects() {
        const studentsText = this.studentsTextarea.value.trim();
        const students = studentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        // 列制約のプルダウンを更新
        if (this.columnConstraints) {
            const constraintSelects = this.columnConstraints.querySelectorAll('.student-select');
            constraintSelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = `
                    <option value="">生徒を選択</option>
                    ${students.map(student => `<option value="${student}">${student}</option>`).join('')}
                `;
                // 前の選択値が存在する場合は復元
                if (students.includes(currentValue)) {
                    select.value = currentValue;
                }
            });
        }

        // 固定席のプルダウンを更新
        if (this.fixedSeats) {
            const fixedSeatSelects = this.fixedSeats.querySelectorAll('.student-select');
            fixedSeatSelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = `
                    <option value="">生徒を選択</option>
                    ${students.map(student => `<option value="${student}">${student}</option>`).join('')}
                `;
                // 前の選択値が存在する場合は復元
                if (students.includes(currentValue)) {
                    select.value = currentValue;
                }
            });
        }

        // 行制約のプルダウンを更新
        if (this.rowConstraintsContainer) {
            const rowConstraintSelects = this.rowConstraintsContainer.querySelectorAll('.student-select');
            rowConstraintSelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = `
                    <option value="">生徒を選択</option>
                    ${students.map(student => `<option value="${student}">${student}</option>`).join('')}
                `;
                // 前の選択値が存在する場合は復元
                if (students.includes(currentValue)) {
                    select.value = currentValue;
                }
            });
        }
    }

    // 入力フィールドの範囲を更新
    updateInputRanges() {
        const rows = parseInt(this.rowsInput.value) || 1;
        const cols = parseInt(this.colsInput.value) || 1;

        // 列制約の列番号フィールドを更新
        if (this.columnConstraints) {
            const columnInputs = this.columnConstraints.querySelectorAll('.column-input');
            columnInputs.forEach(input => {
                input.max = cols;
                // 現在の値が範囲外の場合はクリア
                if (parseInt(input.value) > cols) {
                    input.value = '';
                }
            });
        }

        // 固定席の行・列番号フィールドを更新
        if (this.fixedSeats) {
            const rowInputs = this.fixedSeats.querySelectorAll('.row-input');
            rowInputs.forEach(input => {
                input.max = rows;
                // 現在の値が範囲外の場合はクリア
                if (parseInt(input.value) > rows) {
                    input.value = '';
                }
            });

            const fixedColumnInputs = this.fixedSeats.querySelectorAll('.column-input');
            fixedColumnInputs.forEach(input => {
                input.max = cols;
                // 現在の値が範囲外の場合はクリア
                if (parseInt(input.value) > cols) {
                    input.value = '';
                }
            });
        }

        // 行制約の行番号フィールドを更新
        if (this.rowConstraintsContainer) {
            const rowConstraintInputs = this.rowConstraintsContainer.querySelectorAll('.row-input');
            rowConstraintInputs.forEach(input => {
                input.max = rows;
                // 現在の値が範囲外の場合はクリア
                if (parseInt(input.value) > rows) {
                    input.value = '';
                }
            });
        }
    }
}


// アプリケーション初期化
let seatingArranger;
document.addEventListener('DOMContentLoaded', () => {
    seatingArranger = new SeatingArranger();
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('shuffle-btn').click();
    }
});
