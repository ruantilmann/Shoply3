"use client";

import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AccountForm() {
    const { data: session } = authClient.useSession();

    const form = useForm({
        defaultValues: {
            name: session?.user.name ?? "",
            image: session?.user.image ?? "",
        },
        validators: {
            onSubmit: z.object({
                name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
                image: z.string().url("URL de imagem inválida").or(z.literal("")),
            }),
        },
        onSubmit: async ({ value }) => {
            const payload: { name?: string; image?: string } = {};
            if (value.name) payload.name = value.name;
            if (value.image) payload.image = value.image;
            const res = await authClient.updateUser(payload);
            if (res?.error) {
                toast.error(res.error.message || "Falha ao atualizar usuário");
                return;
            }
            toast.success("Dados atualizados com sucesso");
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-4"
        >
            <div>
                <form.Field name="name">
                    {(field) => (
                        <div className="space-y-2">
                            <Label htmlFor={field.name}>Nome</Label>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.errors.map((error) => (
                                <p key={String(error)} className="text-red-500">
                                    {String(error)}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>
            </div>
            <div>
                <form.Field name="image">
                    {(field) => (
                        <div className="space-y-2">
                            <Label htmlFor={field.name}>URL da imagem</Label>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.errors.map((error) => (
                                <p key={String(error)} className="text-red-500">
                                    {String(error)}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>
            </div>
            <form.Subscribe>
                {(state) => (
                    <Button type="submit" disabled={!state.canSubmit || state.isSubmitting}>
                        {state.isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    );
}