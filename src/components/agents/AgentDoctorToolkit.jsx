import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardHat, Download, Loader2 } from 'lucide-react';
import { downloadAgentToolkit } from '@/functions/downloadAgentToolkit';

export default function AgentDoctorToolkit() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await downloadAgentToolkit();

            if (!response.ok || response.status !== 200) {
              const err = await response.json();
              throw new Error(err.error || 'Failed to generate toolkit. Are you an admin?');
            }
            
            const blob = await response.data;
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'agent_doctor.zip');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-white/10 border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-200">
                    <HardHat className="w-6 h-6 text-yellow-400" />
                    Agent Doctor Toolkit
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-400 mb-4">
                    Download a small toolkit with shell scripts and SQL queries to perform local health checks on your agent infrastructure, verify database connections, and run smoke tests.
                </p>
                <Button onClick={handleDownload} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Generating...' : 'Download Toolkit (.zip)'}
                </Button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </CardContent>
        </Card>
    );
}