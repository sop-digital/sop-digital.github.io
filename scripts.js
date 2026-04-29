// --- DATA ---
        const DEVICES = [
            { id: 'axioo-pro-l', name: 'PC AIO Axioo My PC One Pro L', cat: 'computer', trouble: false },
            { id: 'acer-z4', name: 'Desktop Acer Veriton Z4', cat: 'computer', trouble: true },
            { id: 'hp-200-g4', name: 'Desktop HP 200 Pro G4', cat: 'computer', trouble: false },
            { id: 'eps-l3210', name: 'Printer Epson L3210', cat: 'printer', trouble: true },
            { id: 'eps-l14150', name: 'Printer Epson L14150 (Hitam)', cat: 'printer', trouble: false },
            { id: 'eps-ds5310', name: 'Scanner Epson DS-5310II', cat: 'scanner', trouble: false }
        ];

        const ISSUES = [
            { id: 'slow', label: 'Komputer Lambat / Lag', cat: 'computer' },
            { id: 'offline', label: 'Printer Status Offline', cat: 'printer' },
            { id: 'default', label: 'Set Printer Default', cat: 'printer' },
            { id: 'scan-err', label: 'Scanner Tidak Terdeteksi', cat: 'scanner' }
        ];

        const SOP_DATA = {
            'offline': [
                { title: "Cek Kabel Fisik", desc: "Pastikan kabel USB terhubung ke komputer dan printer sudah menyala." },
                { title: "Buka Control Panel", desc: "Ketik 'Control Panel' di Search Windows 11, lalu pilih 'Devices and Printers'." },
                { title: "Lihat Antrean Cetak", desc: "Klik kanan printer Epson Anda, pilih 'See what's printing'." },
                { title: "Matikan Offline", desc: "Klik menu 'Printer', hilangkan centang pada 'Use Printer Offline'." }
            ],
            'slow': [
                { title: "Task Manager", desc: "Tekan Ctrl+Shift+Esc, cek aplikasi yang memakan CPU tinggi." },
                { title: "End Task", desc: "Matikan aplikasi yang tidak perlu dengan klik kanan > End Task." },
                { title: "Hapus Temp", desc: "Win+R, ketik %temp% lalu hapus semua isi filenya." }
            ]
        };

        // --- STATE ---
        let selectedIssue = null;
        let selectedDevice = null;
        let currentStep = 0;
        let searchQuery = '';

        // --- RENDER FUNCTIONS ---
        function renderIssues() {
            const grid = $('#issue-grid');
            grid.empty();
            
            const filtered = ISSUES.filter(i => 
                i.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                i.cat.includes(searchQuery.toLowerCase())
            );

            filtered.forEach(issue => {
                const icon = issue.cat === 'printer' ? 'printer' : (issue.cat === 'scanner' ? 'scan' : 'monitor');
                const btn = $(`
                    <button class="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left group">
                        <div class="p-4 bg-gray-50 rounded-xl group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                            <i data-lucide="${icon}" class="w-7 h-7"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg">${issue.label}</h3>
                            <p class="text-xs text-gray-400 uppercase tracking-wider mt-1">${issue.cat}</p>
                        </div>
                        <i data-lucide="chevron-right" class="text-gray-300 group-hover:text-blue-500 w-5 h-5"></i>
                    </button>
                `);
                btn.on('click', () => {
                    selectedIssue = issue;
                    showView('device-pick');
                });
                grid.append(btn);
            });
            lucide.createIcons();
        }

        function renderDevices() {
            const grid = $('#device-grid');
            grid.empty();
            $('#device-title').text(`Pilih Model ${selectedIssue.cat.toUpperCase()}`);

            DEVICES.filter(d => d.cat === selectedIssue.cat).forEach(device => {
                const icon = device.cat === 'printer' ? 'printer' : 'monitor';
                const btn = $(`
                    <button class="relative p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-500 transition-all group text-center">
                        ${device.trouble ? `<span class="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Sering Error</span>` : ''}
                        <div class="w-16 h-16 bg-gray-50 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                            <i data-lucide="${icon}" class="w-8 h-8"></i>
                        </div>
                        <p class="text-sm font-semibold">${device.name}</p>
                    </button>
                `);
                btn.on('click', () => {
                    selectedDevice = device;
                    currentStep = 0;
                    showView('stepper');
                });
                grid.append(btn);
            });
            lucide.createIcons();
        }

        function renderStepper() {
            const steps = SOP_DATA[selectedIssue.id] || SOP_DATA['offline'];
            const data = steps[currentStep];

            $('#video-tag').text(`VIDEO: ${selectedIssue.label}`);
            $('#step-label').text(`Langkah ${currentStep + 1}`);
            $('#step-title').text(data.title);
            $('#step-desc').text(data.desc);
            $('#step-count').text(`${currentStep + 1} / ${steps.length}`);

            $('#prev-step').prop('disabled', currentStep === 0);
            
            if (currentStep === steps.length - 1) {
                $('#next-text').text('Selesai & Berhasil');
                $('#next-step').removeClass('bg-blue-600').addClass('bg-green-600');
            } else {
                $('#next-text').text('Langkah Berikutnya');
                $('#next-step').removeClass('bg-green-600').addClass('bg-blue-600');
            }

            // Timeline
            const timeline = $('#progress-timeline');
            timeline.empty();
            steps.forEach((s, i) => {
                const active = i === currentStep;
                const done = i < currentStep;
                timeline.append(`
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${done ? 'bg-green-500 text-white' : (active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400')}">
                            ${done ? '✓' : i + 1}
                        </div>
                        <p class="text-xs font-bold ${active ? 'text-gray-900' : 'text-gray-400'}">${s.title}</p>
                    </div>
                `);
            });
        }

        // --- NAVIGATION ---
        function showView(viewId) {
            $('.view-content').addClass('hidden');
            $(`#view-${viewId}`).removeClass('hidden');

            if (viewId === 'home') {
                $('#view-title').text('Halo, Apa Masalahnya?');
                $('.sidebar-item').removeClass('active');
                $('#nav-home').addClass('active');
                $('.bottom-item').removeClass('active');
                $('#nav-home-bottom').addClass('active');
                renderIssues();
            } else {
                $('#view-title').text('Panduan Perbaikan');
                $('.sidebar-item').removeClass('active');
                $('#nav-sop').addClass('active');
                $('.bottom-item').removeClass('active');
                $('#nav-sop-bottom').addClass('active');
            }

            if (viewId === 'device-pick') renderDevices();
            if (viewId === 'stepper') renderStepper();
        }

        // --- EVENT HANDLERS ---
        $(document).ready(() => {
            lucide.createIcons();
            showView('home');

            $('#search-box').on('input', function() {
                searchQuery = $(this).val();
                if ($('#view-home').is(':visible')) renderIssues();
            });

            $('#back-to-home, #nav-home, #finish-home').on('click', () => showView('home'));

            $('#next-step').on('click', () => {
                const steps = SOP_DATA[selectedIssue.id] || SOP_DATA['offline'];
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    renderStepper();
                } else {
                    showView('final');
                }
            });

            $('#prev-step').on('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    renderStepper();
                }
            });

            $('#btn-escalate').on('click', () => {
                const form = "https://forms.gle/x5BFYB2W9ZEifgmj7";
                const params = `?entry.123=${selectedDevice.name}&entry.456=${selectedIssue.label}`;
                window.open(form + encodeURI(params), '_blank');
                showView('final');
            });

            $('#nav-help').on('click', () => window.open('https://forms.gle/x5BFYB2W9ZEifgmj7', '_blank'));
            $('#nav-help-bottom').on('click', () => window.open('https://forms.gle/x5BFYB2W9ZEifgmj7', '_blank'));
        });
