import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StepProfileProps {
    onNext: (data: { fullName: string }) => void;
    onBack: () => void;
    initialData?: { fullName: string };
}

export function StepProfile({ onNext, onBack, initialData }: StepProfileProps) {
    const [fullName, setFullName] = useState(initialData?.fullName || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fullName.trim()) {
            onNext({ fullName });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sizi Tanıyalım</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analiz raporlarında size nasıl hitap etmemizi istersiniz?
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Adınız Soyadınız
                    </label>
                    <Input
                        placeholder="Örn: Ahmet Yılmaz"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoFocus
                        required
                        className="h-12 text-lg"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                    Geri
                </Button>
                <Button type="submit" disabled={!fullName.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Devam Et
                </Button>
            </div>
        </form>
    );
}
