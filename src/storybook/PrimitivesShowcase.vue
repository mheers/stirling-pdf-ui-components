<script setup lang="ts">
import { ref } from 'vue';
import {
  CheckCircle2,
  FileStack,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
} from '@lucide/vue';
import Alert from '../components/ui/Alert.vue';
import Badge from '../components/ui/Badge.vue';
import Button from '../components/ui/Button.vue';
import Card from '../components/ui/Card.vue';
import CardContent from '../components/ui/CardContent.vue';
import CardDescription from '../components/ui/CardDescription.vue';
import CardFooter from '../components/ui/CardFooter.vue';
import CardHeader from '../components/ui/CardHeader.vue';
import CardTitle from '../components/ui/CardTitle.vue';
import Checkbox from '../components/ui/Checkbox.vue';
import Dialog from '../components/ui/Dialog.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import Field from '../components/ui/Field.vue';
import Input from '../components/ui/Input.vue';
import Kbd from '../components/ui/Kbd.vue';
import Label from '../components/ui/Label.vue';
import Popover from '../components/ui/Popover.vue';
import Progress from '../components/ui/Progress.vue';
import RadioGroup from '../components/ui/RadioGroup.vue';
import ScrollArea from '../components/ui/ScrollArea.vue';
import SegmentedControl from '../components/ui/SegmentedControl.vue';
import Select from '../components/ui/Select.vue';
import Separator from '../components/ui/Separator.vue';
import Sheet from '../components/ui/Sheet.vue';
import Skeleton from '../components/ui/Skeleton.vue';
import Slider from '../components/ui/Slider.vue';
import Spinner from '../components/ui/Spinner.vue';
import Switch from '../components/ui/Switch.vue';
import Tabs from '../components/ui/Tabs.vue';
import Textarea from '../components/ui/Textarea.vue';
import Tooltip from '../components/ui/Tooltip.vue';

const name = ref('Quarterly report');
const notes = ref('A short note about this document.');
const quality = ref(72);
const notify = ref(true);
const remember = ref(true);
const choice = ref('balanced');
const tab = ref('organize');
const segment = ref('width');
const selected = ref('');
const dialogOpen = ref(false);
const sheetOpen = ref(false);
const progress = ref(64);

const options = [
  { value: 'every', label: 'Every N pages' },
  { value: 'ranges', label: 'Custom ranges' },
  { value: 'single', label: 'Every page' },
];

const tabs = [
  { value: 'organize', label: 'Organize' },
  { value: 'optimize', label: 'Optimize' },
  { value: 'secure', label: 'Secure' },
];

const segments = [
  { value: 'width', label: 'Fit width' },
  { value: 'page', label: 'Fit page' },
  { value: 'actual', label: '100%' },
];

const radioItems = [
  { value: 'light', label: 'Light', description: 'Smallest file, best for email.' },
  { value: 'balanced', label: 'Balanced', description: 'A good mix of quality and size.' },
  { value: 'print', label: 'Print', description: 'Keeps the most detail.' },
];
</script>

<template>
  <div class="spdf grid gap-10">
    <section class="grid gap-3">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Buttons</h2>
      <div class="flex flex-wrap items-center gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="success">Success</Button>
        <Button variant="link">Link</Button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Add"><Plus /></Button>
        <Button loading>Working</Button>
        <Button disabled>Disabled</Button>
      </div>
    </section>

    <section class="grid gap-3">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Badges</h2>
      <div class="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="muted">Muted</Badge>
        <Badge variant="success">Ready</Badge>
        <Badge variant="warning">Needs review</Badge>
        <Badge variant="destructive">Failed</Badge>
        <Badge variant="info">Processing</Badge>
        <Badge variant="brand">Pro</Badge>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="grid gap-4 rounded-xl border border-border bg-card p-5">
        <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Form fields</h2>
        <Field label="Document title" description="Shown in readers and search results." v-slot="{ id, describedBy }">
          <Input :id="id" v-model="name" :aria-describedby="describedBy" />
        </Field>
        <Field v-slot="{ id }" label="Notes" optional>
          <Textarea :id="id" v-model="notes" :rows="3" />
        </Field>
        <Field v-slot="{ id }" label="Page size">
          <Select :id="id" v-model="selected" :options="options" placeholder="Choose a page size" />
        </Field>
        <Field label="Image quality" v-slot="{ id, describedBy }">
          <Slider :id="id" v-model="quality" :aria-describedby="describedBy" show-value suffix="%" />
        </Field>
        <Field v-slot="{ id }" label="With an error" error="A document with this name already exists.">
          <Input :id="id" model-value="report-final.pdf" aria-invalid="true" />
        </Field>
      </div>

      <div class="grid content-start gap-5 rounded-xl border border-border bg-card p-5">
        <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Controls</h2>
        <div class="flex items-center justify-between gap-4">
          <div>
            <Label>Email me when it’s done</Label>
            <p class="text-xs text-muted-foreground">A short summary with the download link.</p>
          </div>
          <Switch v-model="notify" aria-label="Email me when done" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="remember" v-model="remember" />
          <Label for="remember">Remember this choice</Label>
        </div>
        <RadioGroup v-model="choice" :items="radioItems" variant="cards" aria-label="Compression preset" />
        <div class="grid gap-2">
          <Label>Toolbar mode</Label>
          <SegmentedControl v-model="segment" :items="segments" full-width aria-label="Toolbar mode" />
        </div>
        <div class="grid gap-2">
          <Label>Progress</Label>
          <Progress :value="progress" />
          <Progress indeterminate />
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd>/</Kbd> to focus.
        </div>
        <Separator />
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner :size="14" />
          Rendering page 3…
        </div>
        <ScrollArea max-height="96px" class="rounded-lg border border-border p-3 text-xs leading-relaxed text-muted-foreground">
          <p>ScrollArea is a lightweight, styled scroll container.</p>
          <p class="mt-2">It keeps long notes, page lists, and previews inside a bounded region.</p>
          <p class="mt-2">Scrollbars use the same quiet treatment as the PDF viewer.</p>
        </ScrollArea>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="grid gap-4">
        <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Tabs</h2>
        <Tabs v-model="tab" :items="tabs" />
        <div class="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Active tab: <span class="font-medium text-foreground">{{ tab }}</span>
        </div>
        <Alert variant="info" title="A helpful note">
          Info alerts are for context, not errors. Keep the copy short.
        </Alert>
        <Alert variant="success" title="Signed and sealed">
          The document is ready to share with your team.
        </Alert>
        <Alert variant="warning" title="Check the margins">
          Content is very close to the page edge.
        </Alert>
        <Alert variant="destructive" title="Couldn’t open this PDF">
          The file may be damaged or use an unsupported feature.
        </Alert>
      </div>

      <div class="grid gap-4">
        <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Cards & overlays</h2>
        <Card>
          <CardHeader>
            <CardTitle>Ready to export</CardTitle>
            <CardDescription>12 pages · 2.4 MB · compressed with the balanced preset.</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-wrap items-center gap-2">
            <Button size="sm"><CheckCircle2 class="size-3.5" /> Download</Button>
            <Button size="sm" variant="outline"><RefreshCw class="size-3.5" /> Start over</Button>
          </CardContent>
          <CardFooter class="justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Balanced preset</span>
            <span>12 pages</span>
          </CardFooter>
        </Card>

        <div class="flex flex-wrap items-center gap-2">
          <Tooltip content="Add a blank page">
            <Button variant="outline" size="sm"><FileStack class="size-3.5" /> Tooltip</Button>
          </Tooltip>
          <Popover>
            <template #trigger>
              <Button variant="outline" size="sm"><Settings2 class="size-3.5" /> Popover</Button>
            </template>
            <div class="grid gap-2">
              <p class="text-sm font-medium">Quick settings</p>
              <Slider v-model="quality" label="Quick image quality" show-value suffix="%" />
            </div>
          </Popover>
          <Button variant="outline" size="sm" @click="dialogOpen = true">Dialog</Button>
          <Button variant="outline" size="sm" @click="sheetOpen = true">Sheet</Button>
        </div>

        <EmptyState
          title="No files yet"
          description="Drop a PDF here to start organizing pages."
          :icon="FileStack"
          compact
        />

        <div class="grid gap-2">
          <Skeleton class="h-4 w-2/3" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
    </section>

    <Dialog v-model:open="dialogOpen" title="Delete this page?" description="This removes the page from the export. You can still undo it." size="sm">
      <p class="text-sm text-muted-foreground">Page 4 contains a large scan and will be removed from the output.</p>
      <template #footer>
        <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
        <Button variant="destructive" @click="dialogOpen = false"><Trash2 class="size-4" /> Delete page</Button>
      </template>
    </Dialog>

    <Sheet v-model:open="sheetOpen" title="Document settings" description="Adjust the output without leaving the page.">
      <div class="grid gap-4">
        <Slider v-model="quality" label="Image quality" show-value suffix="%" />
        <div class="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <p class="text-sm font-medium">Embed fonts</p>
            <p class="text-xs text-muted-foreground">Keeps text sharp in every reader.</p>
          </div>
          <Switch v-model="notify" />
        </div>
        <Alert variant="info"><Info class="size-4" /> Changes apply to the next export.</Alert>
      </div>
      <template #footer>
        <Button variant="outline" @click="sheetOpen = false">Cancel</Button>
        <Button @click="sheetOpen = false"><Sparkles class="size-4" /> Apply</Button>
      </template>
    </Sheet>
  </div>
</template>
