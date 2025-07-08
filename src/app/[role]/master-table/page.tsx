'use client';

import { useState } from 'react';
import axios from 'axios';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import api from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { dropdownApi } from '@/services/api/dropdown';

type MasterType =
    | 'Domain'
    | 'Domain Role'
    | 'Domain Level'
    | 'Segment'
    | 'Delivery Type'
    | 'Project/Support Type'
    | 'Delivery Motion'
    | 'Laptop Provider'
    | 'Leave Type'
    | 'Location'
    | 'Manager Type'
    | 'Regions'
    | 'States'

interface MasterData {
    id: number;
    name: string;
    domainID: number;
    domainName: string;
    stateID: number;
    stateName: string;
    isActive: boolean;
}

const getApiType = (type: string): string => {
    const typeMap: Record<string, string> = {
        'Domain': 'domain',
        'Contact Type': 'contacttype',
        'Domain Role': 'domainrole',
        'Domain Level': 'domainlevel',
        'Segment': 'segment',
        'Delivery Motion': 'deliverymotion',
        'Project/Support Type': 'supportType',
        'Laptop Provider': 'laptopprovider',
        'Leave Type': 'leavetype',
        'Location': 'location',
        'Manager Type': 'managertype',
        'Regions': 'regions',
        'States': 'states',
    };
    return typeMap[type] || type.toLowerCase().replace(/\s+/g, '');
};

export default function MasterPage() {
    const [selectedType, setSelectedType] =  useState<MasterType | ''>('');
    const [data, setData] = useState<MasterData[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    // const [editingId, setEditingId] = useState<number | null>(null);
    const [editedRow, setEditedRow] = useState<Partial<MasterData>>({});

    const masterTypes: MasterType[] = [
        'Domain',
        'Domain Role',
        'Domain Level',
        'Segment',
        'Delivery Motion',
        'Project/Support Type',
        'Laptop Provider',
        'Leave Type',
        'States',
        'Location',
        'Manager Type',
        'Regions',
    ];


    const { data: states = [] } = useQuery({
        queryKey: ["states"],
        queryFn: dropdownApi.fetchStates,
    });

    const { data: domains = [] } = useQuery({
        queryKey: ["domains"],
        queryFn: dropdownApi.fetchDomian,
    });

    const fetchMasterData = async (type: string) => {
        setLoading(true);
        try {
            const apiType = getApiType(type);
            const response = await api.get(`/Master/${apiType}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
            setData([]);
            toast.error('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value as MasterType);
        fetchMasterData(value);
    };

    const handleInputChange = (key: keyof MasterData, value: string | boolean) => {
        setEditedRow((prev) => ({
            ...prev,
            [key]: value,
        }));
    };


    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !editedRow?.name?.trim()) {
            toast.error('Please select a type and enter a name');
            return;
        }

        try {
            const apiType = getApiType(selectedType);
            await api.post(`/Master/${apiType}`, {
                name: editedRow.name,
                stateID: editedRow.stateID,
                domainID: editedRow.domainID,
                isActive: true
            });

            toast.success('Item added successfully');
            setIsAddDialogOpen(false);
            setEditedRow(null);
            fetchMasterData(selectedType);
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Failed to add item. Please try again.');
        }
    };

    const startEditing = (item: MasterData) => {
        setEditedRow(item);
    };

    const cancelEditing = () => {
        setEditedRow(null);
    };

    const handleSave = async (item: MasterData) => {
        if (!selectedType || !item.name.trim()) return;

        try {
            const apiType = getApiType(selectedType);
            await api.put(`/Master/${apiType}/${item.id}`, {
                id: item.id,
                name: editedRow.name,
                stateID: editedRow.stateID,
                domainID: editedRow.domainID,
                isActive: item.isActive
            });

            toast.success('Item updated successfully');
            setEditedRow(null);
            fetchMasterData(selectedType);
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item. Please try again.');
        }
    };

    const toggleStatus = async (item: MasterData) => {
        if (!selectedType) return;

        try {
            const apiType = getApiType(selectedType);
            await api.put(`/Master/${apiType}/${item.id}`, {
                id: item.id,
                name: item.name,
                domainID: item.domainID,
                stateID: item.stateID,
                isActive: !item.isActive
            });

            toast.success('Status updated successfully');
            fetchMasterData(selectedType);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status. Please try again.');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Master Data Management</CardTitle>
                    {selectedType && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New {selectedType}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New {selectedType}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddItem} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editedRow?.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            placeholder={`Enter ${selectedType} name`}
                                            required
                                        />
                                    </div>

                                    {selectedType === "Domain Role" && <div className="space-y-2">
                                        <Label htmlFor="name">Domain</Label>
                                        <Select value={editedRow?.domainID?.toString()} onValueChange={(e) => handleInputChange("domainID", e)}>
                                            <SelectTrigger className="w-[470px]">
                                                <SelectValue placeholder="Select domain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {domains.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>}

                                    {selectedType === "Location" && <div className="space-y-2">
                                        <Label htmlFor="name">State</Label>
                                        <Select value={editedRow?.stateID?.toString()} onValueChange={(e) => handleInputChange("stateID", e)}>
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {states.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>}

                                    <Button type="submit" className="w-full">
                                        Add
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <Select value={selectedType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select master type" />
                            </SelectTrigger>
                            <SelectContent>
                                {masterTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        {selectedType === "Domain Role" && <TableHead>Domain Name</TableHead>}
                                        {selectedType === "Location" && <TableHead>State</TableHead>}
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>
                                                {editedRow?.id === item.id ? (
                                                    <Input
                                                        value={editedRow?.name}
                                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                                        className="w-full"
                                                    />
                                                ) : (
                                                    item.name
                                                )}
                                            </TableCell>

                                            {selectedType === "Domain Role" && <TableCell>
                                                {editedRow?.id === Number(item.id) ?
                                                    <Select value={editedRow?.domainID?.toString()} onValueChange={(e) => handleInputChange("domainID", e)}>
                                                        <SelectTrigger className="w-[280px]">
                                                            <SelectValue placeholder="Select state" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {domains.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    : (item.domainName || "")}
                                            </TableCell>}

                                            {selectedType === "Location" && <TableCell>
                                                {editedRow?.id === Number(item.id) ?
                                                    <Select value={editedRow?.stateID?.toString()} onValueChange={(e) => handleInputChange("stateID", e)}>
                                                        <SelectTrigger className="w-[280px]">
                                                            <SelectValue placeholder="Select state" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {states.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    : (item.stateName || "")}
                                            </TableCell>
                                            }
                                            <TableCell>
                                                <Switch
                                                    checked={item.isActive}
                                                    onCheckedChange={() => toggleStatus(item)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {editedRow?.id === item.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSave(item)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={cancelEditing}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditing(item)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                {selectedType
                                                    ? 'No data available'
                                                    : 'Select a type to view data'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}