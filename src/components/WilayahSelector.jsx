import { useState, useEffect } from 'react';

const BASE_URL = 'https://open-api.my.id/api/wilayah';

export default function WilayahSelector({ onSelect, disabled }) {
    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    const [selected, setSelected] = useState({
        province: '',
        regency: '',
        district: '',
        village: ''
    });

    const [loading, setLoading] = useState({
        prov: false, reg: false, dis: false, vil: false
    });

    // Fetch Provinces on mount
    useEffect(() => {
        setLoading(prev => ({ ...prev, prov: true }));
        fetch(`${BASE_URL}/provinces`)
            .then(res => res.json())
            .then(data => setProvinces(data || []))
            .catch(err => console.error("Failed to load provinces", err))
            .finally(() => setLoading(prev => ({ ...prev, prov: false })));
    }, []);

    const handleProvinceChange = (e) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setSelected({ province: { id, name }, regency: '', district: '', village: '' });
        setRegencies([]); setDistricts([]); setVillages([]);
        onSelect(null); // Reset parent selection

        if (id) {
            setLoading(prev => ({ ...prev, reg: true }));
            fetch(`${BASE_URL}/regencies/${id}`)
                .then(res => res.json())
                .then(data => setRegencies(data || []))
                .catch(err => console.error(err))
                .finally(() => setLoading(prev => ({ ...prev, reg: false })));
        }
    };

    const handleRegencyChange = (e) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setSelected(prev => ({ ...prev, regency: { id, name }, district: '', village: '' }));
        setDistricts([]); setVillages([]);
        onSelect(null);

        if (id) {
            setLoading(prev => ({ ...prev, dis: true }));
            fetch(`${BASE_URL}/districts/${id}`)
                .then(res => res.json())
                .then(data => setDistricts(data || []))
                .catch(err => console.error(err))
                .finally(() => setLoading(prev => ({ ...prev, dis: false })));
        }
    };

    const handleDistrictChange = (e) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setSelected(prev => ({ ...prev, district: { id, name }, village: '' }));
        setVillages([]);
        onSelect(null);

        if (id) {
            setLoading(prev => ({ ...prev, vil: true }));
            fetch(`${BASE_URL}/villages/${id}`)
                .then(res => res.json())
                .then(data => setVillages(data || []))
                .catch(err => console.error(err))
                .finally(() => setLoading(prev => ({ ...prev, vil: false })));
        }
    };

    const handleVillageChange = (e) => {
        const id = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        const finalSelection = { ...selected, village: { id, name } };
        setSelected(finalSelection);

        // Pass generic string format to parent: "Kel. X, Kec. Y, Kota Z, Prov. A"
        const fullAddress = `${name}, ${selected.district.name}, ${selected.regency.name}, ${selected.province.name}`;
        onSelect({
            fullAddress,
            details: finalSelection
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
                <label className="form-label">Provinsi</label>
                <select className="form-select" onChange={handleProvinceChange} disabled={disabled || loading.prov}>
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {selected.province && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">Kabupaten/Kota {loading.reg && '...'}</label>
                    <select className="form-select" onChange={handleRegencyChange} disabled={disabled || loading.reg}>
                        <option value="">-- Pilih Kab/Kota --</option>
                        {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {selected.regency && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">Kecamatan {loading.dis && '...'}</label>
                    <select className="form-select" onChange={handleDistrictChange} disabled={disabled || loading.dis}>
                        <option value="">-- Pilih Kecamatan --</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            )}

            {selected.district && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">Kelurahan/Desa {loading.vil && '...'}</label>
                    <select className="form-select" onChange={handleVillageChange} disabled={disabled || loading.vil}>
                        <option value="">-- Pilih Kelurahan --</option>
                        {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}
